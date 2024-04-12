import {
	Tree,
	formatFiles,
	getProjects,
	logger,
	readJson,
	readProjectConfiguration,
	visitNotIgnoredFiles,
} from '@nx/devkit';
import { readFileSync } from 'node:fs';
import { exit } from 'node:process';
import { Node, Project } from 'ts-morph';
import { ConvertDiToInjectGeneratorSchema } from './schema';

class ContentsStore {
	private _project: Project = null!;

	collection: Array<{ path: string; content: string }> = [];

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
			!fileContent.includes('constructor(') &&
			!fileContent.includes('@Pipe') &&
			!fileContent.includes('@Injectable') &&
			!fileContent.includes('@Directive')
		) {
			return;
		}

		if (fileContent.includes('constructor(')) {
			contentsStore.track(fullPath, fileContent);
		}
	}
}

export async function convertDiToInjectGenerator(
	tree: Tree,
	options: ConvertDiToInjectGeneratorSchema,
) {
	const contentsStore = new ContentsStore();
	const packageJson = readJson(tree, 'package.json');
	const angularCorePackage = packageJson['dependencies']['@angular/core'];

	if (!angularCorePackage) {
		logger.error(`[ngxtension] No @angular/core detected`);
		return exit(1);
	}

	const { path, project } = options;

	if (path && project) {
		logger.error(
			`[ngxtension] Cannot pass both "path" and "project" to convertDiToInjectGenerator`,
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

		const hasInjectImport = sourceFile.getImportDeclaration(
			(importDecl) =>
				importDecl.getModuleSpecifierValue() === '@angular/core' &&
				importDecl
					.getNamedImports()
					.some((namedImport) => namedImport.getName() === 'inject'),
		);

		const classes = sourceFile.getClasses();

		for (const targetClass of classes) {
			const applicableDecorator = targetClass.getDecorator((decoratorDecl) => {
				return ['Component', 'Directive', 'Pipe', 'Injectable'].includes(
					decoratorDecl.getName(),
				);
			});
			if (!applicableDecorator) continue;

			const convertedDeps = new Set<string>();

			targetClass.getConstructors().forEach((constructor) => {
				constructor.getParameters().forEach((param, index) => {
					const { name, type, decorators, scope, isReadonly } =
						param.getStructure();

					let shouldUseType = false;
					let toBeInjected = type; // default to type
					const flags = [];

					if (decorators.length > 0) {
						decorators.forEach((decorator) => {
							if (decorator.name === 'Inject') {
								toBeInjected = decorator.arguments[0]; // use the argument of the @Inject decorator
								if (toBeInjected !== type) {
									shouldUseType = true;
								}
							}
							if (decorator.name === 'Optional') {
								flags.push('optional');
							}
							if (decorator.name === 'Self') {
								flags.push('self');
							}
							if (decorator.name === 'SkipSelf') {
								flags.push('skipSelf');
							}
							if (decorator.name === 'Host') {
								flags.push('host');
							}
						});
					}

					// if type is (ElementRef or TemplateRef) or should use type, add it as inject generic

					let injection = 'inject';

					const typeHasGenerics = type.toString().includes('<');

					if (shouldUseType || typeHasGenerics) {
						injection += `<${type}>`;
					}

					targetClass.insertProperty(index, {
						name,
						initializer: `${injection}(${toBeInjected}${flags.length > 0 ? `, { ${flags.map((flag) => flag + ': true').join(', ')} }` : ''})`,
						scope,
						isReadonly,
						leadingTrivia: '  ',
					});

					convertedDeps.add(name);

					// check if service was used inside the constructor without 'this.' prefix
					// if so, add 'this.' prefix to the service
					constructor.getStatements().forEach((statement) => {
						if (Node.isExpressionStatement(statement)) {
							const expression = statement.getExpression();
							if (Node.isCallExpression(expression)) {
								const expressionText = expression.getText();
								if (
									expressionText.includes(name.toString()) &&
									!expressionText.includes(`this.${name.toString()}`)
								) {
									const newExpression = expressionText.replace(
										name.toString(),
										`this.${name}`,
									);
									statement.replaceWithText(newExpression);
								}
							}
						}
					});
				});

				if (convertedDeps.size > 0 && !hasInjectImport) {
					sourceFile.insertImportDeclaration(0, {
						namedImports: ['inject'],
						moduleSpecifier: '@angular/core',
						leadingTrivia: '  ',
					});
				}

				constructor.getParameters().forEach((param) => {
					if (convertedDeps.has(param.getName())) {
						param.remove();
					}
				});

				if (
					constructor.getParameters().length === 0 &&
					constructor.getBodyText().trim() === ''
				) {
					constructor.remove();
				}
			});
		}

		tree.write(sourcePath, sourceFile.getFullText());
	}

	await formatFiles(tree);

	logger.info(
		`
[ngxtension] Conversion completed. Please check the content and run your formatter as needed.
`,
	);
}

export default convertDiToInjectGenerator;
