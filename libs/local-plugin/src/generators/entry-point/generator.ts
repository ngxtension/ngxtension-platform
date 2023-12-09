import { librarySecondaryEntryPointGenerator } from '@nx/angular/generators';
import type { GeneratorOptions as SecondaryEntryPointGeneratorOptions } from '@nx/angular/src/generators/library-secondary-entry-point/schema';
import { formatFiles, Tree } from '@nx/devkit';
import convertEntryPointToProjectGenerator from '../convert-entry-point-to-project/generator';

export async function entryPointGenerator(
	tree: Tree,
	options: SecondaryEntryPointGeneratorOptions,
) {
	await librarySecondaryEntryPointGenerator(tree, options);
	await convertEntryPointToProjectGenerator(tree, {
		name: options.name,
		project: options.library,
	});
	await formatFiles(tree);
}

export default entryPointGenerator;
