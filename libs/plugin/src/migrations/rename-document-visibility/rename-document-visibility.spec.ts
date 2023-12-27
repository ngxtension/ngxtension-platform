import * as devkit from '@nx/devkit';
import { addProjectConfiguration, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import update from './rename-document-visibility';

describe('rename-document-visibility migration', () => {
	let tree: Tree;

	async function setup() {
		tree = createTreeWithEmptyWorkspace();
		jest
			.spyOn(devkit, 'formatFiles')
			.mockImplementation(() => Promise.resolve());
		addProjectConfiguration(tree, 'lib-one', {
			name: 'lib-one',
			root: 'libs/lib-one',
			sourceRoot: 'libs/lib-one/src',
			projectType: 'library',
		});

		tree.write(
			'libs/lib-one/src/lib/lib-one.component.ts',
			`
		import { injectDocumentVisibility } from 'ngxtension/document-visibility-state';
    `,
		);
	}

	it('should run successfully', async () => {
		await setup();
		await update(tree);

		const content = tree.read(
			'libs/lib-one/src/lib/lib-one.component.ts',
			'utf8',
		);
		expect(content).not.toContain('document-visibility-state');
		expect(content).toContain('inject-document-visibility');
	});
});
