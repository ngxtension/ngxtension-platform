import {
	formatFiles,
	getProjects,
	joinPathFragments,
	logger,
	readJson,
	readProjectConfiguration,
	Tree,
	visitNotIgnoredFiles,
} from '@nx/devkit';
import { readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { exit } from 'node:process';
import {
	CallExpression,
	CodeBlockWriter,
	Decorator,
	Node,
	PropertyDeclaration,
	SyntaxKind,
	WriterFunction,
} from 'ts-morph';
import { ContentsStore } from '../shared-utils/contents-store';
import { migrateTemplateVariablesToSignals } from '../shared-utils/migrate-signals-in-template';
import {
	getAngularCoreImports,
	getStartLineInfo,
} from '../shared-utils/migrate-signals-in-ts';
import { ConvertSignalInputsGeneratorSchema } from './schema';

function trackContents(
	tree: Tree,
	contentsStore: ContentsStore,
	fullPath: string,
) {
	if (fullPath.endsWith('.ts')) {
		const fileContent =
			tree.read(fullPath, 'utf8') || readFileSync(fullPath, 'utf8');
		if (
			!fileContent.includes('@Component') &&
			!fileContent.includes('@Directive')
		) {
			return;
		}

		if (fileContent.includes('@Input')) {
			contentsStore.track(fullPath, fileContent);
		}
	}
}

function getSignalInputInitializer(
	contentsStore: ContentsStore,
	className: string,
	decorator: Decorator,
	property: PropertyDeclaration,
): WriterFunction {
	const propertyInitializer = property.getInitializer();
	const propertyTypeNode = property.getTypeNode();
	const decoratorArg = decorator.getArguments()[0];

	const writeTypeNodeAndInitializer = (
		writer: CodeBlockWriter,
		isRequired = false,
		transformType = '',
		defaultToUndefined = false,
	) => {
		if (transformType) {
			contentsStore.withTransforms.add(className);
		}

		if (propertyTypeNode) {
			const typeNode = propertyTypeNode.getText();
			const types = ['<'];

			if (transformType) {
				types.push(transformType, ',');
			}

			if (
				propertyInitializer?.getType() === undefined &&
				Node.isObjectLiteralExpression(decoratorArg) &&
				property.hasQuestionToken()
			) {
				types.push(typeNode);
				types.push('| undefined');
			} else {
				if (property.getInitializer()?.getText().includes('undefined')) {
					types.push(typeNode);
				} else {
					types.push(typeNode.replace('| undefined', ''));
				}
			}

			if (transformType) {
				types.push('| string');
			}

			writer.write(types.concat('>').join(''));
		}

		writer.write('(');

		if (!isRequired) {
			let defaultValue = propertyInitializer
				? propertyInitializer.getText()
				: defaultToUndefined
					? 'undefined'
					: '';

			if (defaultValue) {
				if (['boolean', 'number'].includes(transformType)) {
					defaultValue = `${transformType}Attribute(${defaultValue})`;
				}
				writer.write(defaultValue);
			}
		}
	};

	return (writer) => {
		// write input
		writer.write('input');

		if (Node.isObjectLiteralExpression(decoratorArg)) {
			let required = false;
			const inputOptions = decoratorArg
				.getProperties()
				.filter(Node.isPropertyAssignment)
				.reduce((acc, propertyAssignment) => {
					if (propertyAssignment.getName() === 'required') {
						required = true;
						return acc;
					}
					acc.push(propertyAssignment.getText());
					return acc;
				}, [] as string[]);

			let optionsAsText = '';
			if (inputOptions.length) {
				optionsAsText += `{${inputOptions.join(', ')}}`;
			}

			if (required) {
				writer.write('.required');
			}

			let transformType = '';

			if (optionsAsText.includes('booleanAttribute')) {
				transformType = 'boolean';
			} else if (optionsAsText.includes('numberAttribute')) {
				transformType = 'number';
			} else if (optionsAsText.includes('transform:')) {
				transformType = 'any';
			}

			writeTypeNodeAndInitializer(writer, required, transformType, true);
			if (required) {
				writer.write(optionsAsText ? `${optionsAsText})` : ')');
			} else {
				writer.write(optionsAsText ? `, ${optionsAsText})` : ')');
			}
		} else if (Node.isStringLiteral(decoratorArg)) {
			writeTypeNodeAndInitializer(writer, false, '', true);
			writer.write(`, { alias: ${decoratorArg.getText()} })`);
		} else {
			writeTypeNodeAndInitializer(writer, false, '', false);
		}
	};
}

export async function convertSignalInputsGenerator(
	tree: Tree,
	options: ConvertSignalInputsGeneratorSchema,
) {
	const contentsStore = new ContentsStore();
	const packageJson = readJson(tree, 'package.json');
	const angularCorePackage = packageJson['dependencies']['@angular/core'];

	if (!angularCorePackage) {
		logger.error(`[ngxtension] No @angular/core detected`);
		return exit(1);
	}

	const [major, minor] = angularCorePackage
		.split('.')
		.slice(0, 2)
		.map((part: string) => {
			if (part.startsWith('^') || part.startsWith('~')) {
				return Number(part.slice(1));
			}
			return Number(part);
		});

	if (major < 17 || (major >= 17 && minor < 1)) {
		logger.error(
			`[ngxtension] Signal Input is only available in v17.1 and later`,
		);
		return exit(1);
	}

	const { path, project } = options;

	if (path && project) {
		logger.error(
			`[ngxtension] Cannot pass both "path" and "project" to convertSignalInputsGenerator`,
		);
		return exit(1);
	}

	if (path) {
		if (!tree.exists(path)) {
			logger.error(`[ngxtension] "${path}" does not exist`);
			return exit(1);
		}

		trackContents(tree, contentsStore, path);
	} else if (project) {
		try {
			const projectConfiguration = readProjectConfiguration(tree, project);

			if (!projectConfiguration) {
				throw `"${project}" project not found`;
			}

			visitNotIgnoredFiles(tree, projectConfiguration.root, (path) => {
				trackContents(tree, contentsStore, path);
			});
		} catch (err) {
			logger.error(`[ngxtension] ${err}`);
			return;
		}
	} else {
		const projects = getProjects(tree);
		for (const project of projects.values()) {
			visitNotIgnoredFiles(tree, project.root, (path) => {
				trackContents(tree, contentsStore, path);
			});
		}
	}

	for (const { path: sourcePath } of contentsStore.collection) {
		const sourceFile = contentsStore.project.getSourceFile(sourcePath)!;

		const hasSignalInputImport = sourceFile.getImportDeclaration(
			(importDecl) =>
				importDecl.getModuleSpecifierValue() === '@angular/core' &&
				importDecl
					.getNamedImports()
					.some((namedImport) => namedImport.getName() === 'input'),
		);

		const angularCoreImports = getAngularCoreImports(sourceFile);

		// NOTE: only add input import if we don't have it and we find the first Input decorator
		if (!hasSignalInputImport) {
			if (angularCoreImports) {
				angularCoreImports.addNamedImport('input');
			} else {
				sourceFile.addImportDeclaration({
					namedImports: ['input'],
					moduleSpecifier: '@angular/core',
				});
			}
		}

		const classes = sourceFile.getClasses();

		for (const targetClass of classes) {
			const applicableDecorator = targetClass.getDecorator((decoratorDecl) => {
				return ['Component', 'Directive'].includes(decoratorDecl.getName());
			});
			if (!applicableDecorator) continue;

			const convertedInputs = new Set<string>();

			targetClass.forEachChild((node) => {
				if (Node.isPropertyDeclaration(node)) {
					const inputDecorator = node.getDecorator('Input');
					if (inputDecorator) {
						const { name, isReadonly, docs, scope, hasOverrideKeyword } =
							node.getStructure();

						const newProperty = targetClass.addProperty({
							name,
							isReadonly,
							docs,
							scope,
							hasOverrideKeyword,
							initializer: getSignalInputInitializer(
								contentsStore,
								targetClass.getName(),
								inputDecorator,
								node,
							),
						});

						node.replaceWithText(newProperty.print());

						// fail gracefully for nodes not terminated with a semi-colon
						try {
							// remove old class property Input
							newProperty.remove();
						} catch (err) {
							logger.warn(
								`[ngxtension] "${path}" Failed to parse node, check that declarations are terminated with a semicolon and try again`,
							);
							throw err;
						}

						// track converted inputs
						convertedInputs.add(name);
					}
				}
			});

			if (convertedInputs.size) {
				// process decorator metadata references
				const decoratorArg = applicableDecorator.getArguments()[0];
				if (Node.isObjectLiteralExpression(decoratorArg)) {
					decoratorArg
						.getChildrenOfKind(SyntaxKind.PropertyAssignment)
						.forEach((property) => {
							const decoratorPropertyName = property.getName();

							if (decoratorPropertyName === 'template') {
								// const templateAst = parseTemplate(
								// 	property.getFullText(),
								// 	`${path}.html`,
								// );
							}

							if (
								decoratorPropertyName === 'host' ||
								decoratorPropertyName === 'template'
							) {
								let originalText = property.getFullText();
								originalText = migrateTemplateVariablesToSignals(
									originalText,
									convertedInputs,
								);

								if (originalText !== property.getFullText()) {
									property.replaceWithText(originalText);
								}
							} else if (decoratorPropertyName === 'templateUrl') {
								const dir = dirname(sourcePath);
								const templatePath = joinPathFragments(
									dir,
									property
										.getInitializer()
										.getText()
										.slice(1, property.getInitializer().getText().length - 1),
								);
								let templateText = tree.exists(templatePath)
									? tree.read(templatePath, 'utf8')
									: '';

								if (templateText) {
									templateText = migrateTemplateVariablesToSignals(
										templateText,
										convertedInputs,
									);
									tree.write(templatePath, templateText);
								}
							}
						});
				}

				// process ts class references
				const nonNullifyProperties = new Map<string, string>();
				for (const propertyAccessExpression of targetClass.getDescendantsOfKind(
					SyntaxKind.PropertyAccessExpression,
				)) {
					const propertyExpression = propertyAccessExpression.getExpression();
					if (!Node.isThisExpression(propertyExpression)) continue;

					const propertyName = propertyAccessExpression.getName();
					if (!convertedInputs.has(propertyName)) continue;

					const startLineInfo = getStartLineInfo(propertyAccessExpression);

					const ifParent = propertyAccessExpression.getFirstAncestorByKind(
						SyntaxKind.IfStatement,
					);

					const ternaryParent = propertyAccessExpression.getFirstAncestorByKind(
						SyntaxKind.ConditionalExpression,
					);

					if (
						(ifParent &&
							getStartLineInfo(ifParent.getExpression()) === startLineInfo) ||
						(ternaryParent &&
							getStartLineInfo(ternaryParent.getCondition()) === startLineInfo)
					) {
						nonNullifyProperties.set(propertyName, startLineInfo);
					}

					const callExpression = propertyAccessExpression.replaceWithText(
						`${propertyAccessExpression.getText()}()`,
					) as CallExpression;

					// this means that this property has been used in an if/ternary condition above
					if (
						nonNullifyProperties.has(propertyName) &&
						nonNullifyProperties.get(propertyName) !== startLineInfo
					) {
						callExpression.replaceWithText(`${callExpression.getText()}!`);
					}
				}
			}
		}

		// if @Input is not used anymore, remove the import
		const hasInputDecoratorUsage = sourceFile.getFullText().includes('@Input');
		if (!hasInputDecoratorUsage) {
			const inputImport = sourceFile.getImportDeclaration(
				(importDecl) =>
					importDecl.getModuleSpecifierValue() === '@angular/core' &&
					importDecl
						.getNamedImports()
						.some((namedImport) => namedImport.getName() === 'Input'),
			);

			if (inputImport) {
				const classToRemove = inputImport
					.getNamedImports()
					.find((namedImport) => namedImport.getName() === 'Input');
				classToRemove.remove();
			}
		}

		tree.write(sourcePath, sourceFile.getFullText());
	}

	if (contentsStore.withTransforms.size) {
		logger.info(
			`
[ngxtension] The following classes have had some Inputs with "transform" converted. Please double check the type arguments on the "transform" Inputs
`,
		);
		contentsStore.withTransforms.forEach((className) => {
			logger.info(`- ${className}`);
		});
	}

	await formatFiles(tree);

	logger.info(
		`
[ngxtension] Conversion completed. Please check the content and run your formatter as needed.
`,
	);
}

export default convertSignalInputsGenerator;
