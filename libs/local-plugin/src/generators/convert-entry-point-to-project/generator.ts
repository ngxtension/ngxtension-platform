import {
	Tree,
	addProjectConfiguration,
	formatFiles,
	getWorkspaceLayout,
	logger,
	readJson,
	readProjectConfiguration,
	updateJson,
} from '@nx/devkit';
import type { ConvertEntryPointToProjectGeneratorSchema } from './schema';

export async function convertEntryPointToProjectGenerator(
	tree: Tree,
	options: ConvertEntryPointToProjectGeneratorSchema,
) {
	const { name, project } = options;
	if (name === 'src') {
		logger.warn(`[local-plugin] entry point "src" is invalid`);
		return;
	}

	const projectConfiguration = readProjectConfiguration(tree, project);

	const projectPackageJson = readJson(
		tree,
		projectConfiguration.root + '/package.json',
	);

	if (!projectPackageJson.name) {
		logger.error(
			`[local-plugin] project ${project} does not have a name in package.json`,
		);
		return;
	}

	const { libsDir } = getWorkspaceLayout(tree);

	const entryPointPath = libsDir
		? `${libsDir}/${project}/${name}`
		: `${project}/${name}`;

	const isExist = tree.exists(entryPointPath);
	if (!isExist) {
		logger.error(`[local-plugin] ${name} not found as an entry point`);
		return;
	}

	const isProjectJsonExist = tree.exists(`${entryPointPath}/project.json`);
	if (isProjectJsonExist) {
		logger.info(`[local-plugin] ${name} entry point is already a Project`);
		return;
	}

	addProjectConfiguration(tree, `${projectPackageJson.name}/${name}`, {
		root: entryPointPath,
		projectType: 'library',
		sourceRoot: `${entryPointPath}/src`,
		targets: {
			test: {
				executor: '@nx/jest:jest',
				outputs: ['{workspaceRoot}/coverage/{projectRoot}'],
				options: {
					jestConfig: `${projectConfiguration.root}/jest.config.ts`,
					testPathPattern: [name],
					passWithNoTests: true,
				},
				configurations: {
					ci: {
						ci: true,
						codeCoverage: true,
					},
				},
			},
			lint: {
				executor: '@nx/eslint:lint',
				outputs: ['{options.outputFile}'],
				options: {
					lintFilePatterns: [
						`${entryPointPath}/**/*.ts`,
						`${entryPointPath}/**/*.html`,
					],
				},
			},
		},
	});

	updateJson(tree, `${projectConfiguration.root}/project.json`, (json) => {
		if (json.targets?.lint?.options?.lintFilePatterns) {
			json.targets.lint.options.lintFilePatterns =
				json.targets.lint.options.lintFilePatterns.filter(
					(pattern: string) => !pattern.includes(entryPointPath),
				);
		}
		return json;
	});

	await formatFiles(tree);
}

export default convertEntryPointToProjectGenerator;
