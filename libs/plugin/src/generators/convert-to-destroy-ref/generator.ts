import {
	formatFiles,
	getProjects,
	logger,
	readProjectConfiguration,
	Tree,
} from '@nx/devkit';
import { exit } from 'node:process';
import {
	ClassDeclaration,
	MethodDeclaration,
	Project,
	Scope,
	SourceFile,
} from 'ts-morph';
import { assertDependencyExist } from '../shared-utils/assert-dependency-exist';
import { assertDependencyVersion } from '../shared-utils/assert-dependency-version';
import { removeImport } from '../shared-utils/import-utils';
import { syncNxTreeWithTsMorph } from '../shared-utils/sync-nx-tree-with-ts-morph';
import { ConvertToDestroyrefSchema } from './schema';

export async function convertToDestroyRefGenerator(
	tree: Tree,
	options: ConvertToDestroyrefSchema,
) {
	logger.info('[ngxtension] Converting to DestroyRef');

	assertDependencyExist({
		tree,
		dependencyName: '@angular/core',
	});
	assertDependencyVersion({
		tree,
		dependencyName: '@angular/core',
		featureName: 'DestroyRef',
		targetVersion: {
			major: 16,
			minor: 0,
		},
	});

	const predicate = (filePath: string) => {
		// read content
		const fileContent = tree.read(filePath, 'utf-8');
		// check if file content contains ngOnDestroy
		return fileContent.includes('ngOnDestroy');
	};
	const { path, project } = options;

	if (path && project) {
		logger.error(
			`[ngxtension] Cannot pass both "path" and "project" to convertToDestroyRefGenerator`,
		);
		return exit(1);
	}
	const tsMorphProject = new Project({ useInMemoryFileSystem: true });

	if (path && !project) {
		if (path && !tree.exists(path)) {
			logger.error(`[ngxtension] "${path}" does not exist`);
			return exit(1);
		}
		syncNxTreeWithTsMorph({
			project: tsMorphProject,
			tree,
			projectRoot: path,
			predicate,
		});
	}

	if (project && !path) {
		const projectConfiguration = readProjectConfiguration(tree, project);

		if (!projectConfiguration) {
			logger.error(`"${project}" project not found`);
			return exit(1);
		}

		syncNxTreeWithTsMorph({
			project: tsMorphProject,
			tree,
			projectRoot: projectConfiguration.root,
			predicate,
		});
	}

	if (!path && !project) {
		const projects = getProjects(tree);
		for (const project of projects.values()) {
			syncNxTreeWithTsMorph({
				project: tsMorphProject,
				tree,
				projectRoot: project.root,
				predicate,
			});
		}
	}

	// run the migration for all collected source files
	const sourceFiles = tsMorphProject.getSourceFiles();

	for (const sourceFile of sourceFiles) {
		const hasNgOnDestroy = sourceFile
			.getClasses()
			.some((classDecl) => classDecl.getMethod('ngOnDestroy'));

		if (!hasNgOnDestroy) continue;

		migrateFile(sourceFile, options.useEsprivateFieldNotation ?? false);
		await sourceFile.save();
		tree.write(sourceFile.getFilePath(), sourceFile.getFullText());
	}

	await formatFiles(tree);
	logger.info(
		`
[ngxtension] Conversion completed. Please check the content and run your formatter as needed.
`,
	);
}

function migrateFile(
	sourceFile: SourceFile,
	useEsprivateFieldNotation: boolean,
) {
	// Handle imports
	updateImports(sourceFile);

	// Process each class in the file
	sourceFile.getClasses().forEach((classDeclaration) => {
		const ngOnDestroyMethod = classDeclaration.getMethod('ngOnDestroy');
		if (!ngOnDestroyMethod) return;

		migrateClass(
			classDeclaration,
			ngOnDestroyMethod,
			useEsprivateFieldNotation,
		);
	});
}

function updateImports(sourceFile: SourceFile) {
	// Remove OnDestroy from imports
	sourceFile.getImportDeclarations().forEach((importDecl) => {
		if (importDecl.getModuleSpecifier().getText().includes('@angular/core')) {
			const namedImports = importDecl.getNamedImports();
			const onDestroyImport = namedImports.find(
				(named) => named.getName() === 'OnDestroy',
			);

			// Add inject and DestroyRef if they don't exist
			if (!namedImports.some((named) => named.getName() === 'inject')) {
				importDecl.addNamedImport('inject');
			}
			if (!namedImports.some((named) => named.getName() === 'DestroyRef')) {
				importDecl.addNamedImport('DestroyRef');
			}
		}
	});
	removeImport('OnDestroy', '@angular/core', sourceFile);
}

function migrateClass(
	classDecl: ClassDeclaration,
	ngOnDestroyMethod: MethodDeclaration,
	useEsprivateFieldNotation: boolean,
) {
	// Remove implements OnDestroy
	const implementsClause = classDecl.getImplements();

	const implemendsOnDestroyIndex = implementsClause.findIndex(
		(impl) => impl.getText() === 'OnDestroy',
	);

	classDecl.removeImplements(implemendsOnDestroyIndex);

	// Extract ngOnDestroy body
	const ngOnDestroyBody = ngOnDestroyMethod.getBodyText() || '';

	// Create new destroyRef field
	const properties = classDecl.getProperties();
	const insertIndex = properties.length > 0 ? properties[0].getChildIndex() : 0;

	classDecl.insertProperty(insertIndex, {
		name: useEsprivateFieldNotation ? '#destroyRef' : 'destroyRef',
		initializer: `inject(DestroyRef).onDestroy(() => {${ngOnDestroyBody}})`,
		scope: useEsprivateFieldNotation ? null : Scope.Private,
		isReadonly: true,
	});

	// Remove ngOnDestroy method
	ngOnDestroyMethod.remove();
}

export default convertToDestroyRefGenerator;
