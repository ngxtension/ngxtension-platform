import { Tree, readJson } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import { initGenerator } from './generator';

describe('init generator', () => {
	let tree: Tree;

	beforeEach(() => {
		tree = createTreeWithEmptyWorkspace();
	});

	it('should run successfully', async () => {
		await initGenerator(tree);
		const packageJson = readJson(tree, 'package.json');
		expect(packageJson.dependencies['ngxtension']).toEqual('latest');
	});
});
