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

				// replace imports of ngxtension/computed-from with ngxtension/derived-from
				let updatedContent = content.replace(
					/ngxtension\/computed-from/g,
					'ngxtension/derived-from',
				);

				// replace imports of ngxtension/computed-async with ngxtension/derived-async
				updatedContent = updatedContent.replace(
					/ngxtension\/computed-async/g,
					'ngxtension/derived-async',
				);

				// replace usage of computedFrom with derivedFrom and computedAsync with derivedAsync
				updatedContent = updatedContent.replace(/computedFrom/g, 'derivedFrom');

				updatedContent = updatedContent.replace(
					/computedAsync/g,
					'derivedAsync',
				);

				if (updatedContent !== content) {
					host.write(path, updatedContent);
				}
			}
		});
	}

	await formatFiles(host);
}
