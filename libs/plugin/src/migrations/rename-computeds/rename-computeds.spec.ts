import * as devkit from '@nx/devkit';
import { addProjectConfiguration, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import update from './rename-computeds';

describe('rename-computeds migration', () => {
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
		import { computedAsync } from 'ngxtension/computed-async';
		import { computedFrom } from 'ngxtension/computed-from';

		export class LibOneComponent {
		  data = computedFrom([of(1), of(2)]);
		  otherData = computedAsync(() => of(1));
		}
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

		expect(content).toContain('derivedFrom');
		expect(content).toContain('derivedAsync');
		expect(content).not.toContain('computedFrom');
		expect(content).not.toContain('computedAsync');

		expect(content).not.toContain('ngxtension/computed-from');
		expect(content).not.toContain('ngxtension/computed-async');

		expect(content).toContain('ngxtension/derived-from');
		expect(content).toContain('ngxtension/derived-async');
	});
});
