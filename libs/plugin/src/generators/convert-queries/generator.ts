import {
	formatFiles,
	getProjects,
	logger,
	readJson,
	readProjectConfiguration,
	Tree,
	visitNotIgnoredFiles,
} from '@nx/devkit';
import { readFileSync } from 'node:fs';
import { exit } from 'node:process';
import {
	CodeBlockWriter,
	Decorator,
	Node,
	Project,
	WriterFunction,
} from 'ts-morph';
import { migrateSignalsInClassOrDecorator } from '../shared-utils/migrate-signals-in-ts';
import { ConvertContentQueriesGeneratorSchema } from './schema';

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

const CONTENT_QUERIES = [
	'ContentChild',
	'ContentChildren',
	'ViewChild',
	'ViewChildren',
];

function trackContents(
	tree: Tree,
	contentsStore: ContentsStore,
	fullPath: string,
) {
	if (fullPath.endsWith('.ts')) {
		const fileContent =
			tree.read(fullPath, 'utf8') || readFileSync(fullPath, 'utf8');

		const decoratorUsage = CONTENT_QUERIES.map((d) => `@${d}`);

		if (!decoratorUsage.some((d) => fileContent.includes(d))) {
			return;
		}

		contentsStore.track(fullPath, fileContent);
	}
}

function getQueryInitializer(
	propertyName: string,
	type: string | WriterFunction,
	decorator: Decorator,
): {
	writerFn: WriterFunction;
} {
	const [selector, options] = decorator.getArguments();

	const selectorText = selector.getFullText();

	const decoratorToSignalMap = {
		ContentChild: 'contentChild',
		ViewChild: 'viewChild',
		ViewChildren: 'viewChildren',
		ContentChildren: 'contentChildren',
	};

	return {
		writerFn: (writer: CodeBlockWriter) => {
			writer.write(decoratorToSignalMap[decorator.getFullName()]);

			if (typeof type === 'string') {
				// add type if exists

				if (type.includes('QueryList')) {
					// ex: Nullable<QueryList<PrimeTemplate>>
					// replace it to just be a normal array using regex and replace
					// for example: QueryList<PrimeTemplate> => PrimeTemplate[]
					// ex: Nullable<QueryList<PrimeTemplate>> => Nullable<PrimeTemplate[]>

					// Regular expression pattern to match QueryList<T>
					const pattern = /QueryList<([^>]+)>/g;

					// Replace QueryList<T> with T[]
					type = type.replace(pattern, '$1[]');
				}

				if (type === selectorText) {
					// don't write the type if it's the same as the selector
				} else {
					writer.write(`<${type}>`);
				}
			}

			writer.write('(');
			writer.write(selectorText);

			// TODO: add options
			writer.write(')');
		},
	};
}

function stringIsUsedMoreThanOnce(key: string, fileFullText: string): boolean {
	const regExp = new RegExp(key, 'g');
	const matches = fileFullText.match(regExp);
	return matches && matches.length > 1;
}

export async function convertQueriesGenerator(
	tree: Tree,
	options: ConvertContentQueriesGeneratorSchema,
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

	if (major < 17 || (major >= 17 && minor < 3)) {
		logger.error(`[ngxtension] output() is only available in v17.3 and later`);
		return exit(1);
	}

	const { path, project } = options;

	if (path && project) {
		logger.error(
			`[ngxtension] Cannot pass both "path" and "project" to convertOutputsGenerator`,
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

		// const hasQueriesImports = sourceFile.getImportDeclaration(
		// 	(importDecl) =>
		// 		importDecl.getModuleSpecifierValue() === '@angular/core' &&
		// 		importDecl
		// 			.getNamedImports()
		// 			.some((namedImport) => CONTENT_QUERIES.includes(namedImport.getName())),
		// );

		// // NOTE: only add hasOutputImport import if we don't have it and we find the first Output decorator
		// if (!hasOutputImport) {
		// 	const angularCoreImports = sourceFile.getImportDeclaration(
		// 		(importDecl) => {
		// 			return importDecl.getModuleSpecifierValue() === '@angular/core';
		// 		},
		// 	);
		// 	if (angularCoreImports) {
		// 		angularCoreImports.addNamedImport('output');
		// 	} else {
		// 		sourceFile.addImportDeclaration({
		// 			namedImports: ['output'],
		// 			moduleSpecifier: '@angular/core',
		// 		});
		// 	}
		// }

		const classes = sourceFile.getClasses();

		for (const targetClass of classes) {
			const applicableDecorator = targetClass.getDecorator((decoratorDecl) => {
				return ['Component', 'Directive'].includes(decoratorDecl.getName());
			});
			if (!applicableDecorator) continue;

			const convertedQueries = new Set<{
				type:
					| 'ContentChild'
					| 'ContentChildren'
					| 'ViewChild'
					| 'ViewChildren'
					| string;
				name: string;
			}>();

			targetClass.forEachChild((node) => {
				if (Node.isPropertyDeclaration(node)) {
					for (const query of CONTENT_QUERIES) {
						const queryDecorator = node.getDecorator(query);

						if (queryDecorator) {
							const {
								name,
								isReadonly,
								docs,
								scope,
								type,
								hasOverrideKeyword,
								initializer,
							} = node.getStructure();

							// TODO: skip if it's a setter

							const { writerFn } = getQueryInitializer(
								name,
								type,
								queryDecorator,
							);

							// if (
							//   needsOutputFromObservableImport &&
							//   !outputFromObservableImportAdded
							// ) {
							//   const angularRxjsInteropImports = sourceFile.getImportDeclaration(
							//     (importDecl) => {
							//       return (
							//         importDecl.getModuleSpecifierValue() ===
							//         '@angular/core/rxjs-interop'
							//       );
							//     },
							//   );
							//   if (angularRxjsInteropImports) {
							//     angularRxjsInteropImports.addNamedImport(
							//       'outputFromObservable',
							//     );
							//   } else {
							//     sourceFile.addImportDeclaration({
							//       namedImports: ['outputFromObservable'],
							//       moduleSpecifier: '@angular/core/rxjs-interop',
							//     });
							//   }
							//
							//   outputFromObservableImportAdded = true;
							// }

							const newProperty = targetClass.addProperty({
								name,
								isReadonly,
								docs,
								scope,
								hasOverrideKeyword,
								initializer: writerFn,
							});

							// if (removeOnlyDecorator) {
							//   queryDecorator.remove();
							//
							//   newProperty.setHasExclamationToken(false);
							//
							//   newProperty.addJsDoc(
							//     'TODO(migration): you may want to convert this to a normal output',
							//   );
							// } else {
							node.replaceWithText(newProperty.print());
							// remove old class property Output
							newProperty.remove();
							// }

							// track converted outputs
							if (name) {
								convertedQueries.add({ name, type: query });
							}
						}
					}
				}
			});

			const convertedVariables: Map<string, string> = new Map();
			convertedQueries.forEach((query) =>
				convertedVariables.set(query.name, query.name),
			);

			if (convertedVariables.size > 0) {
				migrateSignalsInClassOrDecorator(
					tree,
					sourcePath,
					targetClass,
					applicableDecorator,
					convertedVariables,
				);
			}
		}

		// if @Output is not used anymore, remove the import
		const hasOutputDecoratorUsage = sourceFile
			.getFullText()
			.includes('@Output');
		if (!hasOutputDecoratorUsage) {
			const outputImport = sourceFile.getImportDeclaration(
				(importDecl) =>
					importDecl.getModuleSpecifierValue() === '@angular/core' &&
					importDecl
						.getNamedImports()
						.some((namedImport) => namedImport.getName() === 'Output'),
			);

			if (outputImport) {
				const classToRemove = outputImport
					.getNamedImports()
					.find((namedImport) => namedImport.getName() === 'Output');
				classToRemove.remove();
			}
		}

		// // if EventEmitter is not used anymore, remove the import
		const eventEmitterIsUsedMoreThanOnce = stringIsUsedMoreThanOnce(
			'EventEmitter',
			sourceFile.getFullText(),
		);
		if (!eventEmitterIsUsedMoreThanOnce) {
			const eventEmitterImport = sourceFile.getImportDeclaration(
				(importDecl) =>
					importDecl.getModuleSpecifierValue() === '@angular/core' &&
					importDecl
						.getNamedImports()
						.some((namedImport) => namedImport.getName() === 'EventEmitter'),
			);
			if (eventEmitterImport) {
				const classToRemove = eventEmitterImport
					.getNamedImports()
					.find((namedImport) => namedImport.getName() === 'EventEmitter');
				classToRemove.remove();
			}
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

export default convertQueriesGenerator;
