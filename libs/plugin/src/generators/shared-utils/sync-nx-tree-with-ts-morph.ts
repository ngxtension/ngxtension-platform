import { Tree, visitNotIgnoredFiles } from '@nx/devkit';
import { Project } from 'ts-morph';

export function syncNxTreeWithTsMorph(options: {
	project: Project;
	tree: Tree;
	projectRoot: string;
	predicate?: (filePath: string) => boolean;
}) {
	visitNotIgnoredFiles(options.tree, options.projectRoot, (filePath) => {
		if (filePath.endsWith('.ts')) {
			if (options.predicate && !options.predicate(filePath)) {
				return;
			}
			const fileContent = options.tree.read(filePath, 'utf-8');
			if (fileContent) {
				options.project.createSourceFile(filePath, fileContent, {
					overwrite: true,
				});
			}
		}
	});
}
