import {
	Block,
	Element as Element_2,
	HtmlParser,
	ParseTreeResult,
	RecursiveVisitor,
	Text as Text_2,
	visitAll,
} from '@angular-eslint/bundled-angular-compiler';
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
	ImportDeclaration,
	Node,
	Project,
	PropertyDeclaration,
	SourceFile,
	SyntaxKind,
	WriterFunction,
} from 'ts-morph';
import { ConvertSignalInputsGeneratorSchema } from './schema';

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
				types.push(typeNode.replace('| undefined', ''));
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
								originalText = migrateTemplate(originalText, convertedInputs);

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
									templateText = migrateTemplate(templateText, convertedInputs);
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

function migrateTemplate(
	template: string,
	convertedInputs: Set<string>,
): string {
	const parsedTemplate: ParseTreeResult = new HtmlParser().parse(
		template,
		'template.html',
		{
			tokenizeBlocks: true,
		},
	);

	const sortedInputsFromLongest = Array.from(convertedInputs).sort(
		(a, b) => b.length - a.length,
	);

	const visitor = new ElementCollector(sortedInputsFromLongest);
	visitAll(visitor, parsedTemplate.rootNodes);

	let changedOffset = 0;
	visitor.elements.forEach((element) => {
		// replace the input with the new input based on start and end
		const { start, end, value, inputs, type } = element;

		if (type === 'interpolation') {
			const replacedValue = replaceInputsInsideInterpolation(value, inputs);
			template = replaceTemplate(
				template,
				replacedValue,
				start,
				end,
				changedOffset,
			);
			changedOffset += replacedValue.length - value.length;
		} else if (type === 'property-binding') {
			const replacedValue = replaceOnlyIfNotWrappedInQuotesOrPropertyAccess(
				value,
				inputs,
			);
			template = replaceTemplate(
				template,
				replacedValue,
				start,
				end,
				changedOffset,
			);
			changedOffset += replacedValue.length - value.length;
		} else if (type === 'event-binding') {
			const replacedValue = replaceOnlyIfNotWrappedInQuotesOrPropertyAccess(
				value,
				inputs,
			);
			template = replaceTemplate(
				template,
				replacedValue,
				start,
				end,
				changedOffset,
			);
			changedOffset += replacedValue.length - value.length;
		} else if (type === 'structural-directive') {
			const replacedValue = replaceOnlyIfNotWrappedInQuotesOrPropertyAccess(
				value,
				inputs,
			);
			template = replaceTemplate(
				template,
				replacedValue,
				start,
				end,
				changedOffset,
			);
			changedOffset += replacedValue.length - value.length;
		} else if (type === 'block') {
			const replacedValue = replaceOnlyIfNotWrappedInQuotesOrPropertyAccess(
				value,
				inputs,
			);
			template = replaceTemplate(
				template,
				replacedValue,
				start,
				end,
				changedOffset,
			);
			changedOffset += replacedValue.length - value.length;
		}
	});

	return template;
}

/** Finds all elements that are using my input in some way */
class ElementCollector extends RecursiveVisitor {
	readonly elements: ElementToMigrate[] = [];

	constructor(private inputs: string[] = []) {
		super();
	}

	// collect all places where we can have dynamic values
	// 1. interpolation
	// 2. property binding
	// 3. event binding
	// 4. structural directive
	// 5. animations - not supported yet

	override visitText(ast: Text_2, context: any): any {
		if (ast.value.includes('{{')) {
			const usedInputs = collectUsedInputs(ast.value, this.inputs);

			if (usedInputs.length) {
				this.elements.push({
					type: 'interpolation',
					value: ast.value,
					inputs: usedInputs,
					start: ast.sourceSpan.start.offset,
					end: ast.sourceSpan.end.offset,
				});
			}
		}
		return super.visitText(ast, context);
	}

	override visitElement(element: Element_2, context: any) {
		if (element.attrs.length > 0) {
			for (const attr of element.attrs) {
				if (attr.name.startsWith('[') && attr.name.endsWith(']')) {
					// property binding
					const usedInputs = collectUsedInputs(attr.value, this.inputs);

					if (usedInputs.length) {
						this.elements.push({
							type: 'property-binding',
							value: attr.value,
							inputs: usedInputs,
							start: attr.valueSpan.start.offset,
							end: attr.valueSpan.end.offset,
						});
					}
				}

				if (attr.name.startsWith('(') && attr.name.endsWith(')')) {
					// event binding
					const usedInputs = collectUsedInputs(attr.value, this.inputs);

					if (usedInputs.length) {
						this.elements.push({
							type: 'event-binding',
							value: attr.value,
							inputs: usedInputs,
							start: attr.valueSpan.start.offset,
							end: attr.valueSpan.end.offset,
						});
					}
				}

				if (attr.name.startsWith('*')) {
					// structural directive
					const usedInputs = collectUsedInputs(attr.value, this.inputs);

					if (usedInputs.length) {
						this.elements.push({
							type: 'structural-directive',
							value: attr.value,
							inputs: usedInputs,
							start: attr.valueSpan.start.offset,
							end: attr.valueSpan.end.offset,
						});
					}
				}
			}
		}
		return super.visitElement(element, context);
	}

	override visitBlock(block: Block, context: any): any {
		if (block.parameters.length > 0) {
			block.parameters.forEach((param) => {
				const usedInputs = collectUsedInputs(param.expression, this.inputs);

				if (usedInputs.length) {
					this.elements.push({
						type: 'block', // if, else if, for, switch, case
						value: param.expression,
						inputs: usedInputs,
						start: param.sourceSpan.start.offset,
						end: param.sourceSpan.end.offset,
					});
				}
			});
		}
		return super.visitBlock(block, context);
	}
}

function collectUsedInputs(value: string, inputs: string[]): string[] {
	const usedInputs = [];
	for (const input of inputs) {
		if (value.includes(input)) {
			usedInputs.push(input);
		}
		if (value === input) {
			break; // if the input is the only thing in the text, we don't need to check further
		}
	}

	return usedInputs;
}

function replaceInputsInsideInterpolation(
	value: string,
	inputs: string[],
): string {
	// find all interpolations and replace the inputs for each interpolation
	value = value.replaceAll(/{{(.*?)}}/g, (match) => {
		const usedInputs = [];
		for (const input of inputs) {
			if (match.includes(input)) {
				usedInputs.push(input);
			}
			if (match === input) {
				break; // if the input is the only thing in the text, we don't need to check further
			}
		}

		if (usedInputs.length) {
			return replaceOnlyIfNotWrappedInQuotesOrPropertyAccess(match, usedInputs);
		}

		return match;
	});

	return value;
}

/**
 * Replace the text only if it's not wrapped in quotes or property access
 */
function replaceOnlyIfNotWrappedInQuotesOrPropertyAccess(
	value: string,
	inputs: string[],
): string {
	// replace only if not wrapped in quotes
	// replace only if doesn't start with . (property access)
	inputs.forEach((input) => {
		const regex = new RegExp(`(?<!['".])\\b${input}\\b(?!['"])`, 'g');
		value = value.replace(regex, `${input}()`);
	});

	return value;
}

/**
 * Replace the value in the template with the new value based on the start and end position + offset
 */
function replaceTemplate(
	template: string,
	replaceValue: string,
	start: number,
	end: number,
	offset: number,
) {
	return (
		template.slice(0, start + offset) +
		replaceValue +
		template.slice(end + offset)
	);
}

export interface ElementToMigrate {
	type:
		| 'interpolation'
		| 'property-binding'
		| 'attribute-binding'
		| 'event-binding'
		| 'two-way-binding'
		| 'structural-directive'
		| 'block';
	value: string;
	inputs: string[];
	start: number;
	end: number;
}

function getAngularCoreImports(sourceFile: SourceFile): ImportDeclaration {
	return sourceFile.getImportDeclaration((importDecl) => {
		return importDecl.getModuleSpecifierValue() === '@angular/core';
	});
}

export default convertSignalInputsGenerator;
