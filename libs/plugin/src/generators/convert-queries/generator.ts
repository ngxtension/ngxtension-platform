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
	Scope,
	WriterFunction,
} from 'ts-morph';
import { ContentsStore } from '../shared-utils/contents-store';
import { importFrom, removeImport } from '../shared-utils/import-utils';
import { migrateSignalsInClassOrDecorator } from '../shared-utils/migrate-signals-in-ts';
import { ConvertContentQueriesGeneratorSchema } from './schema';

const CONTENT_QUERIES = [
	'ContentChild',
	'ContentChildren',
	'ViewChild',
	'ViewChildren',
];

const SIGNAL_CONTENT_QUERIES = [
	'contentChild',
	'contentChildren',
	'viewChild',
	'viewChildren',
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
			const queryFn = decoratorToSignalMap[decorator.getFullName()];
			writer.write(queryFn);

			if (typeof type === 'string') {
				// add type if exists

				if (type.includes('QueryList')) {
					// for example: QueryList<PrimeTemplate> => PrimeTemplate
					// ex: Nullable<QueryList<PrimeTemplate>> => Nullable<PrimeTemplate>
					// Regular expression pattern to match QueryList<T>
					const pattern = /QueryList<([^>]+)>/g;
					// Replace QueryList<T> with T
					type = type.replace(pattern, '$1');
				}

				let addGeneric = true;

				if (type === selectorText) {
					// don't write the type if it's the same as the selector
					addGeneric = false;
				}
				if (queryFn === 'viewChildren' || queryFn === 'contentChildren') {
					// don't write the type in viewChildren and contentChildren if it has a pattern like this:
					// headerElements = viewChildren<HeaderElement[]>(HeaderElement);
					if (type.replace('[]', '') === selectorText) {
						addGeneric = false;
					}
				}

				if (addGeneric) {
					writer.write(`<${type}>`);
				}
			}

			writer.write('(');
			writer.write(selectorText);

			if (options) {
				// { read: ElementRef, descendants: true, static: true }
				if (Node.isObjectLiteralExpression(options)) {
					const decoratorOptions = options
						.getProperties()
						.filter(Node.isPropertyAssignment)
						.reduce((acc, propertyAssignment) => {
							if (propertyAssignment.getName() === 'static') {
								return acc;
							}
							acc.push(propertyAssignment.getText());
							return acc;
						}, [] as string[]);
					if (decoratorOptions.length > 0) {
						writer.write(`, { ${decoratorOptions.join(', ')} }`);
					}
				}
			}

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

	if ([major, minor] < [17, 3]) {
		logger.error(`[ngxtension] queries is only available in v17.3 and later`);
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

		const classes = sourceFile.getClasses();

		let shouldImportToObservable = false;

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
							} = node.getStructure();

							const { writerFn } = getQueryInitializer(
								name,
								type,
								queryDecorator,
							);

							const newProperty = targetClass.addProperty({
								name,
								isReadonly,
								docs,
								scope,
								hasOverrideKeyword,
								initializer: writerFn,
							});

							node.replaceWithText(newProperty.print());
							newProperty.remove();

							if (name) {
								convertedQueries.add({ name, type: query });
							}

							// After the first query is converted, break the loop to avoid checking the same node again
							break;
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

				const variablesToAddChangesProperty = new Set<string>();

				// replace the .changes with the new property
				convertedVariables.forEach((value, key) => {
					const changesPatterns = [
						`this.${key}().changes`,
						`this.${key}()?.changes`,
						`this.${key}()!.changes`,
					];

					// find the pattern in the source text
					targetClass.forEachDescendant((node) => {
						if (Node.isPropertyAccessExpression(node)) {
							const propertyAccess = node;
							for (const pattern of changesPatterns) {
								if (propertyAccess.getExpression().getText() === pattern) {
									propertyAccess.forEachChild((x) => {
										if (x.getText() === pattern) {
											x.replaceWithText(`this.${key}Changes`);
											variablesToAddChangesProperty.add(key);
										}
									});
									break;
								}
							}
						}
					});
				});

				for (const key of variablesToAddChangesProperty) {
					const shouldAddChangesProperty = !targetClass.getProperty(
						`${key}Changes`,
					);
					if (shouldAddChangesProperty) {
						targetClass.addProperty({
							name: `${key}Changes`,
							isReadonly: true,
							scope: Scope.Protected,
							initializer: `toObservable(this.${key})`,
						});
						shouldImportToObservable = true;
					}
				}
			}
		}

		SIGNAL_CONTENT_QUERIES.forEach((query) => {
			const sourceText = sourceFile.getFullText();
			if (
				sourceText.includes(`${query}<`) ||
				sourceText.includes(`${query}(`)
			) {
				// usages as: contentChild<Test>, contentChild(), viewChild<Test>, viewChild()
				importFrom(query, '@angular/core', sourceFile);
			}
		});

		if (shouldImportToObservable) {
			importFrom('toObservable', '@angular/core/rxjs-interop', sourceFile);
		}

		// remove the import if the decorator is not used
		CONTENT_QUERIES.forEach((query) => {
			const hasDecoratorUsage = sourceFile.getFullText().includes(`@${query}`);

			if (!hasDecoratorUsage) {
				const queryImport = sourceFile.getImportDeclaration(
					(importDecl) =>
						importDecl.getModuleSpecifierValue() === '@angular/core' &&
						importDecl
							.getNamedImports()
							.some((namedImport) => namedImport.getName() === query),
				);

				if (queryImport) {
					const classToRemove = queryImport
						.getNamedImports()
						.find((namedImport) => namedImport.getName() === query);
					classToRemove.remove();
				}
			}
		});

		// remove QueryList import if it's not used anymore
		const queryListIsUsedMoreThanOnce = stringIsUsedMoreThanOnce(
			'QueryList',
			sourceFile.getFullText(),
		);
		if (!queryListIsUsedMoreThanOnce) {
			removeImport('QueryList', '@angular/core', sourceFile);
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
