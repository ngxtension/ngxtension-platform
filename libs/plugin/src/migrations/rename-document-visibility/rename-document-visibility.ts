import {
	formatFiles,
	getProjects,
	visitNotIgnoredFiles,
	type Tree,
} from '@nx/devkit';

export default async function update(host: Tree) {
	const projects = getProjects(host);

	for (const [, projectConfiguration] of projects.entries()) {
		visitNotIgnoredFiles(host, projectConfiguration.root, (path) => {
			if (path.endsWith('.ts')) {
				const content = host.read(path, 'utf8');
				const updatedContent = content.replace(
					/ngxtension\/document-visibility-state/g,
					'ngxtension/inject-document-visibility',
				);

				if (updatedContent !== content) {
					host.write(path, updatedContent);
				}
			}
		});
	}

	await formatFiles(host);
}
