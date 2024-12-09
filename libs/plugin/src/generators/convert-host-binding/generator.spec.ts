import { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import { convertHostBindingGenerator } from './generator';
import { ConvertHostBindingGeneratorSchema } from './schema';

const filesMap = {
	componentWithHostBinding: `
	import { Component, HostBinding } from '@angular/core';

  @Component({
    selector: 'my-component',
    template: 'My component',
  })
  export class MyComponent {
    @HostBinding('class.active') isActive = true;

    @HostBinding('attr.aria-disabled') get isDisabled() {
      return true;
    }

    @HostBinding('tabIndex') getTabIndex() {
      return this.isDisabled ? -1 : 0;
    }
  }
  `,
	directiveWithHostBinding: `
	import { Directive, HostBinding } from '@angular/core';

  @Directive({
    selector: '[myDirective]'
  })
  export class MyDirective {
    @HostBinding('class.active') isActive = true;

    @HostListener('keydown', ['$event'])
    updateValue(event: KeyboardEvent) {
    }
  }
  `,

	componentWithHostProperty: `
  import { Component } from '@angular/core';

    @Component({
      selector: 'my-component',
      template: 'My component',
      host: {
        '[class.active]': 'isActive',
      }
    })
    export class MyComponent {
      isActive = true;

      @HostBinding('attr.aria-disabled') get isDisabled() {
        return true;
      }
    }
  `,
};

describe('convert-host-binding generator', () => {
	let tree: Tree;
	const options: ConvertHostBindingGeneratorSchema = {
		path: 'libs/my-file.ts',
	};

	function setup(file: keyof typeof filesMap) {
		tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
		tree.write('package.json', `{"dependencies": {"@angular/core": "17.3.0"}}`);
		tree.write(`libs/my-file.ts`, filesMap[file]);

		return () => {
			return [tree.read('libs/my-file.ts', 'utf8'), filesMap[file]];
		};
	}

	beforeEach(() => {
		tree = createTreeWithEmptyWorkspace();
	});

	it('should convert properly for component', async () => {
		const readContent = setup('componentWithHostBinding');
		await convertHostBindingGenerator(tree, options);

		const [updated] = readContent();

		expect(updated).toMatchSnapshot();
	});

	it('should convert properly for directive', async () => {
		const readContent = setup('directiveWithHostBinding');
		await convertHostBindingGenerator(tree, options);

		const [updated] = readContent();

		expect(updated).toMatchSnapshot();
	});

	it('should convert properly for component with host property', async () => {
		const readContent = setup('componentWithHostProperty');
		await convertHostBindingGenerator(tree, options);

		const [updated] = readContent();

		expect(updated).toMatchSnapshot();
	});
});
