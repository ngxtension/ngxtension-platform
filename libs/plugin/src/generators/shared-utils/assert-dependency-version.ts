import { logger, readJson, Tree } from '@nx/devkit';
import { exit } from 'node:process';

export function assertDependencyVersion(options: {
	tree: Tree;
	dependencyName: string;
	dependencyType?: 'dependencies' | 'devDependencies';
	targetVersion: {
		major: number;
		minor: number;
	};
	featureName: string;
}) {
	const packageJson = readJson(options.tree, 'package.json');
	const dependency =
		packageJson[options.dependencyType ?? 'dependencies'][
			options.dependencyName
		];

	const [major, minor] = dependency
		.split('.')
		.slice(0, 2)
		.map((part: string) => {
			if (part.startsWith('^') || part.startsWith('~')) {
				return Number(part.slice(1));
			}
			return Number(part);
		});

	if (
		[major, minor] < [options.targetVersion.major, options.targetVersion.minor]
	) {
		logger.error(
			`[ngxtension] ${options.featureName} is only available in v${options.targetVersion.major}.${options.targetVersion.minor} and later`,
		);
		return exit(1);
	}
}
