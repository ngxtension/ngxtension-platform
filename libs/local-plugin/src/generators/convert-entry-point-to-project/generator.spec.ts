import {
	UnitTestRunner,
	libraryGenerator,
	librarySecondaryEntryPointGenerator,
} from '@nx/angular/generators';
import { Tree, readProjectConfiguration } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import initGenerator from './generator';

const project = 'main-entry';
const entryPoint = 'entry-point';

describe('convert-entry-point-to-project generator', () => {
	let tree: Tree;

	beforeEach(() => {
		tree = createTreeWithEmptyWorkspace();
	});

	async function setup(isReady = false) {
		tree = createTreeWithEmptyWorkspace();

		await libraryGenerator(tree, {
			name: project,
			publishable: true,
			importPath: project,
			routing: false,
			spec: false,
			skipTests: true,
			skipModule: true,
			unitTestRunner: UnitTestRunner.None,
		});

		if (isReady) {
			await librarySecondaryEntryPointGenerator(tree, {
				name: entryPoint,
				library: project,
				skipModule: true,
			});
		}
	}

	//
	it('should run successfully', async () => {
		expect(true).toBeTruthy();
	});

	it('should fail fast for name == "src"', async () => {
		await setup();
		await initGenerator(tree, { name: 'src', project });
		expect(nothingHappened(tree)).toEqual(true);
	});

	it('should throw for a non project', async () => {
		await setup();
		await expect(
			initGenerator(tree, { name: entryPoint, project: 'any' })
		).rejects.toThrowError(/cannot find configuration for 'any'/i);
	});

	it('should work properly', async () => {
		await setup(true);
		await initGenerator(tree, { name: entryPoint, project });
		expect(nothingHappened(tree)).toEqual(false);
	});
});

function nothingHappened(tree: Tree) {
	const projectConfiguration = readProjectConfiguration(tree, project);
	return !tree.exists(
		projectConfiguration.root + '/' + entryPoint + '/project.json'
	);
}
