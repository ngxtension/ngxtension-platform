import { logger, readJson, Tree } from '@nx/devkit';
import { exit } from 'node:process';

export function assertDependencyExist(options: {
	tree: Tree;
	dependencyName: string;
	dependencyType?: 'dependencies' | 'devDependencies';
}) {
	const packageJson = readJson(options.tree, 'package.json');
	const dependency =
		packageJson[options.dependencyType ?? 'dependencies'][
			options.dependencyName
		];

	if (!dependency) {
		logger.error(`[ngxtension] No ${options.dependencyName} detected`);
		return exit(1);
	}
}
