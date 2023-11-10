import {
	addDependenciesToPackageJson,
	formatFiles,
	installPackagesTask,
	logger,
	readJson,
	updateJson,
	type Tree,
} from '@nx/devkit';

export async function initGenerator(tree: Tree) {
	logger.log('Initializing ngxtension...');

	const packageJson = readJson(tree, 'package.json');

	const version =
		packageJson['dependencies']?.['ngxtension'] ||
		packageJson['devDependencies']?.['ngxtension'] ||
		'latest';

	addDependenciesToPackageJson(tree, { ngxtension: version }, {});

	logger.info('Turning on skipLibCheck...');
	const tsConfigPath = tree.exists('tsconfig.base.json')
		? 'tsconfig.base.json'
		: 'tsconfig.json';

	updateJson(tree, tsConfigPath, (json) => {
		if (
			!('skipLibCheck' in json.compilerOptions) ||
			json.compilerOptions?.skipLibCheck === false
		) {
			json.compilerOptions.skipLibCheck = true;
		}

		if (!json.compilerOptions['strict']) {
			logger.warn(`[ngxtension] Initialization script detects that "strict" mode is off in the root TSConfig.
Some utilities will not work properly without strict mode.`);
		}

		return json;
	});

	await formatFiles(tree);

	return () => {
		installPackagesTask(tree);
	};
}

export default initGenerator;
