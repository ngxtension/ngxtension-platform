import {
	getProjects,
	logger,
	readJson,
	readProjectConfiguration,
	Tree,
	visitNotIgnoredFiles,
} from '@nx/devkit';
import { readFileSync } from 'node:fs';
import { exit } from 'node:process';
import { SyntaxKind } from 'ts-morph';
import { ContentsStore } from '../shared-utils/contents-store';
import { ConvertHostBindingGeneratorSchema } from './schema';

const CLASS_DECORATORS = ['Component', 'Directive'];

function trackContents(
	tree: Tree,
	contentsStore: ContentsStore,
	fullPath: string,
) {
	if (fullPath.endsWith('.ts')) {
		const fileContent =
			tree.read(fullPath, 'utf8') || readFileSync(fullPath, 'utf8');

		const decorators = CLASS_DECORATORS.map(
			(decoratorName) => `@${decoratorName}`,
		);

		if (!decorators.some((decorator) => fileContent.includes(decorator))) {
			return;
		}
		contentsStore.track(fullPath, fileContent);
	}
}

export async function convertHostBindingGenerator(
	tree: Tree,
	options: ConvertHostBindingGeneratorSchema,
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
			`[ngxtension] Cannot pass both "path" and "project" to convertHostBinding`,
		);
		return exit(1);
	}

	/** Track contents in the store */
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
	/** end Track contents in the store */

	for (const { path: sourcePath } of contentsStore.collection) {
		const sourceFile = contentsStore.project.getSourceFile(sourcePath);
		addHostProperty(sourceFile);
		removeHostBindingImport(sourceFile);
		tree.write(sourcePath, sourceFile.getFullText());
	}
}

const removeHostBindingImport = (sourceFile) => {
	const packageDir = '@angular/core';
	const foundImport = sourceFile
		.getImportDeclaration(
			(importDeclaration) =>
				importDeclaration.getModuleSpecifierValue() === packageDir,
		)
		.getNamedImports()
		.find((namedImport) => namedImport.getName() === 'HostBinding');

	if (foundImport) {
		foundImport.remove();
	}
};

const addHostProperty = (sourceFile) => {
	sourceFile.getClasses().forEach((klass) => {
		const decorator = klass.getDecorator((decoratorDecl) =>
			CLASS_DECORATORS.includes(decoratorDecl.getName()),
		);
		if (!decorator) {
			return;
		}
		const hostBindings: Record<string, string> = {};
		const hostListeners: Record<string, string> = {};

		const processHostDecorators = (elements, hostBindings, hostListeners) => {
			elements.forEach((element) => {
				const hostBindingDecorator = element.getDecorator('HostBinding');
				if (hostBindingDecorator) {
					const argument = hostBindingDecorator.getArguments()[0];
					const binding = argument
						? getHostBindingKey(argument.getText())
						: element.getName();

					hostBindings[binding] = isMethodDeclaration(element)
						? `'${element.getName()}()'`
						: `'${element.getName()}'`;
					/** Remove the HostBinding decorator */
					hostBindingDecorator.remove();
				}

				const hostListenerDecorator = element.getDecorator('HostListener');
				if (hostListenerDecorator) {
					const [event, ...args] = hostListenerDecorator.getArguments();
					const binding = getHostListenerKey(event.getText());
					hostListeners[binding] = args.length
						? `'${element.getName()}($event)'`
						: `'${element.getName()}()'`;

					/** Remove the HostListener decorator */
					hostListenerDecorator.remove();
				}
			});
		};

		const processProperties = () => {
			processHostDecorators(klass.getProperties(), hostBindings, hostListeners);
		};

		const processGetters = () => {
			processHostDecorators(
				klass.getGetAccessors(),
				hostBindings,
				hostListeners,
			);
		};

		const processMethods = () => {
			processHostDecorators(klass.getMethods(), hostBindings, hostListeners);
		};

		processProperties();
		processGetters();
		processMethods();

		const resolveHostProperties = (hostProperties) => {
			if (Object.keys(hostProperties).length > 0) {
				const hostProperty = decorator.getArguments()[0].getProperty('host');
				if (hostProperty) {
					const existingHostBindings = hostProperty.getInitializerIfKindOrThrow(
						SyntaxKind.ObjectLiteralExpression,
					);
					Object.entries(hostProperties).forEach(([key, value]) => {
						existingHostBindings.addPropertyAssignment({
							name: key,
							initializer: value,
						});
					});
				} else {
					decorator.getArguments()[0].addPropertyAssignment({
						name: 'host',
						initializer: `{ ${Object.entries(hostProperties)
							.map(([key, value]) => `${key}: ${value}`)
							.join(', ')} }`,
					});
				}
			}
		};

		const resolveHostBindings = (hostBindings) => {
			resolveHostProperties(hostBindings);
		};

		const resolveHostListeners = (hostListeners) => {
			resolveHostProperties(hostListeners);
		};

		resolveHostBindings(hostBindings);
		resolveHostListeners(hostListeners);
	});
};

const getHostBindingKey = (hostBinding: string) => {
	return `'[${removeQuotes(hostBinding)}]'`;
};

const getHostListenerKey = (hostListener: string) => {
	return `'(${removeQuotes(hostListener)})'`;
};

function removeQuotes(str: string) {
	return str.replace(/['"]/g, '');
}

function isMethodDeclaration(node) {
	return node.getKindName() === 'MethodDeclaration';
}

export default convertHostBindingGenerator;
