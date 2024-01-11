import {
	Tree,
	formatFiles,
	logger,
	readJson,
	readProjectConfiguration,
	visitNotIgnoredFiles,
} from '@nx/devkit';
import { readFileSync } from 'node:fs';
import { exit } from 'node:process';
import {
	CodeBlockWriter,
	Decorator,
	Node,
	Project,
	PropertyDeclaration,
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

const contentsStore = new ContentsStore();

function trackContents(tree: Tree, fullPath: string) {
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
			if (propertyInitializer) {
				writer.write(propertyInitializer.getText());
			} else if (defaultToUndefined) {
				writer.write('undefined');
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
			writer.write(optionsAsText ? `, ${optionsAsText});` : ');');
		} else if (Node.isStringLiteral(decoratorArg)) {
			writeTypeNodeAndInitializer(writer, false, '', true);
			writer.write(`, { alias: ${decoratorArg.getText()} });`);
		} else {
			writeTypeNodeAndInitializer(writer, false, '', false);
			writer.write(');');
		}
	};
}

export async function convertSignalInputsGenerator(
	tree: Tree,
	options: ConvertSignalInputsGeneratorSchema,
) {
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

		trackContents(tree, path);
	} else if (project) {
		try {
			const projectConfiguration = readProjectConfiguration(tree, project);

			if (!projectConfiguration) {
				throw `"${project}" project not found`;
			}

			visitNotIgnoredFiles(tree, projectConfiguration.root, (path) => {
				trackContents(tree, path);
			});
		} catch (err) {
			logger.error(`[ngxtension] ${err}`);
			return;
		}
	} else {
		visitNotIgnoredFiles(tree, tree.root, (path) => {
			trackContents(tree, path);
		});
	}

	for (const { path: sourcePath } of contentsStore.collection) {
		const sourceFile = contentsStore.project.getSourceFile(sourcePath);

		const classes = sourceFile.getClasses();

		for (const targetClass of classes) {
			const applicableDecorator = targetClass.getDecorator((decoratorDecl) => {
				return ['Component', 'Directive'].includes(decoratorDecl.getName());
			});
			if (!applicableDecorator) continue;

			const hasSignalInputImport = sourceFile.getImportDeclaration(
				(importDecl) =>
					importDecl.getModuleSpecifierValue() === '@angular/core' &&
					importDecl
						.getNamedImports()
						.some((namedImport) => namedImport.getName() === 'input'),
			);

			if (!hasSignalInputImport) {
				sourceFile.addImportDeclaration({
					namedImports: ['input'],
					moduleSpecifier: '@angular/core',
				});
			}

			const classProperties = targetClass.getChildrenOfKind(
				SyntaxKind.PropertyDeclaration,
			);

			for (const classProperty of classProperties) {
				const inputDecorator = classProperty.getDecorator('Input');
				if (!inputDecorator) continue;

				const { name, isReadonly, docs, scope, hasOverrideKeyword } =
					classProperty.getStructure();

				targetClass.addProperty({
					name,
					isReadonly,
					docs,
					scope,
					hasOverrideKeyword,
					initializer: getSignalInputInitializer(
						targetClass.getName(),
						inputDecorator,
						classProperty,
					),
				});

				// remove old class property Input
				classProperty.remove();
			}
		}

		tree.write(sourcePath, sourceFile.print());
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
