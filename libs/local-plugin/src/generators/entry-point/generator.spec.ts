import { UnitTestRunner, libraryGenerator } from '@nx/angular/generators';
import { type Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import entryPointGenerator from './generator';

describe('entry-point generator', () => {
	let tree: Tree;

	async function setup() {
		tree = createTreeWithEmptyWorkspace();

		await libraryGenerator(tree, {
			name: 'main-entry',
			publishable: true,
			importPath: 'main-entry',
			routing: false,
			spec: false,
			skipTests: true,
			skipModule: true,
			unitTestRunner: UnitTestRunner.None,
		});
	}

	it('should run successfully', async () => {
		await setup();
		await entryPointGenerator(tree, {
			name: 'entry-point',
			library: 'main-entry',
			skipModule: true,
		});

		expect(tree.exists('main-entry/entry-point/project.json')).toEqual(true);
	});
});
