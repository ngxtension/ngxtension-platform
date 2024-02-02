import {
	Tree,
	formatFiles,
	getProjects,
	joinPathFragments,
	logger,
	readJson,
	readProjectConfiguration,
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
	Project,
	PropertyDeclaration,
	SyntaxKind,
	WriterFunction,
} from 'ts-morph';
import { ConvertSignalInputsGeneratorSchema } from './schema';
// import { parseTemplate} from '@angular-eslint/bundled-angular-compiler';

class ContentsStore {
	private _project: Project = null!;

	collection: Array<{ path: string; content: string }> = [];
	withTransforms = new Set<string>();

	get project() {
		if (!this._project) {
			this._project = new Project({ useInMemoryFileSystem: true });
		}

		return this._project;
	}

	track(path: string, content: string) {
		this.collection.push({ path, content });
		this.project.createSourceFile(path, content);
	}
}

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
			logger.error(
				`[ngxtension] "${fullPath}" is not a Component nor a Directive`,
			);
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

			types.push(typeNode);

			if (
				!isRequired &&
				!typeNode.includes('undefined') &&
				(property.hasQuestionToken() || !propertyInitializer)
			) {
				types.push('| undefined');
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
				writer.write(optionsAsText ? `${optionsAsText});` : ');');
			} else {
				writer.write(optionsAsText ? `, ${optionsAsText});` : ');');
			}
		} else if (Node.isStringLiteral(decoratorArg)) {
			writeTypeNodeAndInitializer(writer, false, '', true);
			writer.write(`, { alias: ${decoratorArg.getText()} });`);
		} else {
			writeTypeNodeAndInitializer(writer, false, '', false);
			writer.write(');');
		}
	};
}

function getStartLineInfo(node: Node) {
	return `${node.getStartLineNumber()}:${node.getStartLinePos()}:${node.getFullStart()}:${node.getFullWidth()}`;
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
		const sourceFile = contentsStore.project.getSourceFile(sourcePath);

		const hasSignalInputImport = sourceFile.getImportDeclaration(
			(importDecl) =>
				importDecl.getModuleSpecifierValue() === '@angular/core' &&
				importDecl
					.getNamedImports()
					.some((namedImport) => namedImport.getName() === 'input'),
		);

		// NOTE: only add input import if we don't have it and we find the first Input decorator
		if (!hasSignalInputImport) {
			sourceFile.addImportDeclaration({
				namedImports: ['input'],
				moduleSpecifier: '@angular/core',
			});
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

						// remove old class property Input
						newProperty.remove();

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
								convertedInputs.forEach((convertedInput) => {
									originalText = originalText.replaceAll(
										new RegExp(
											`(?<!<)(?<!\\[)(?<![\\w-])\\b${convertedInput}\\b(?!\\])(?!>)(?![\\w-])`,
											'gm',
										),
										`${convertedInput}()`,
									);
								});

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
									convertedInputs.forEach((convertedInput) => {
										templateText = templateText.replaceAll(
											new RegExp(
												`(?<!<)(?<!\\[)(?<![\\w-])\\b${convertedInput}\\b(?!\\])(?!>)(?![\\w-])`,
												'gm',
											),
											`${convertedInput}()`,
										);
									});

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
