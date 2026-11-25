import * as devkit from '@nx/devkit';
import { addProjectConfiguration, type Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import update from './migrate-inject-lazy';

describe('migrate-inject-lazy migration', () => {
	let tree: Tree;

	function setup() {
		tree = createTreeWithEmptyWorkspace();
		jest
			.spyOn(devkit, 'formatFiles')
			.mockImplementation(() => Promise.resolve());
		addProjectConfiguration(tree, 'app', {
			name: 'app',
			root: 'apps/app',
			sourceRoot: 'apps/app/src',
			projectType: 'application',
		});
	}

	function write(filename: string, content: string) {
		tree.write(`apps/app/src/${filename}`, content);
	}

	function read(filename: string) {
		return tree.read(`apps/app/src/${filename}`, 'utf8') ?? '';
	}

	it('replaces the import and renames the call', async () => {
		setup();
		write(
			'cmp.ts',
			`
import { injectLazy } from 'ngxtension/inject-lazy';

export class MyCmp {
  service$ = injectLazy(() => import('./my-service').then(m => m.MyService));
}
      `,
		);

		await update(tree);
		const result = read('cmp.ts');

		expect(result).toMatch(/from ['"]@angular\/core['"]/);
		expect(result).toContain('injectAsync');
		expect(result).not.toContain('injectLazy');
		expect(result).not.toMatch(/['"]ngxtension\/inject-lazy['"]/);
	});

	it('merges injectAsync into an existing @angular/core import', async () => {
		setup();
		write(
			'cmp.ts',
			`
import { inject, Injector } from '@angular/core';
import { injectLazy } from 'ngxtension/inject-lazy';

export class MyCmp {
  svc$ = injectLazy(() => import('./svc').then(m => m.Svc));
}
      `,
		);

		await update(tree);
		const result = read('cmp.ts');

		expect(result.match(/from '@angular\/core'/g)?.length).toBe(1);
		expect(result).toContain('injectAsync');
		expect(result).toContain('inject');
		expect(result).toContain('Injector');
	});

	it('keeps mockLazyProvider import while migrating injectLazy', async () => {
		setup();
		write(
			'cmp.spec.ts',
			`
import { injectLazy, mockLazyProvider } from 'ngxtension/inject-lazy';

export class MyTest {
  svc$ = injectLazy(() => import('./svc').then(m => m.Svc));
}
      `,
		);

		await update(tree);
		const result = read('cmp.spec.ts');

		expect(result).toContain('injectAsync');
		expect(result).toContain('mockLazyProvider');
		expect(result).toMatch(/['"]ngxtension\/inject-lazy['"]/);
		expect(result).not.toContain('injectLazy');
		// Only the injectLazy part moved to @angular/core
		expect(result).toMatch(/from ['"]@angular\/core['"]/);
	});

	it('removes the explicit injector argument', async () => {
		setup();
		write(
			'svc.ts',
			`
import { inject, Injector } from '@angular/core';
import { injectLazy } from 'ngxtension/inject-lazy';

export class MySvc {
  private injector = inject(Injector);
  svc$ = injectLazy(() => import('./svc').then(m => m.Svc), this.injector);
}
      `,
		);

		await update(tree);
		const result = read('svc.ts');

		expect(result).toContain('injectAsync');
		// second argument should be gone
		expect(result).not.toMatch(/injectAsync\([^)]+,\s*this\.injector/);
	});

	it('handles multiple injectLazy calls in the same file', async () => {
		setup();
		write(
			'multi.ts',
			`
import { injectLazy } from 'ngxtension/inject-lazy';

export class Multi {
  a$ = injectLazy(() => import('./a').then(m => m.A));
  b$ = injectLazy(() => import('./b').then(m => m.B));
}
      `,
		);

		await update(tree);
		const result = read('multi.ts');

		// match only call sites (not the import line) by requiring the opening paren
		expect(result.match(/injectAsync\(/g)?.length).toBe(2);
		expect(result).not.toContain('injectLazy');
	});

	it('does not touch files that do not import injectLazy', async () => {
		setup();
		const original = `import { inject } from '@angular/core';\nexport class Clean {}\n`;
		write('clean.ts', original);

		await update(tree);

		expect(read('clean.ts')).toBe(original);
	});
});
