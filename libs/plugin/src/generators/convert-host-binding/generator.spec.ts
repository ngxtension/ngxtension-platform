import { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import { convertHostBindingGenerator } from './generator';
import { ConvertHostBindingGeneratorSchema } from './schema';

const filesMap = {
	componentWithDuplicateHostBinding: `
  import { Component, HostBinding } from '@angular/core';

  @Component({
    selector: 'my-duplicated-component',
    template: 'My duplicated component',
  })
  export class MyDuplicatedComponent {
    @HostBinding('class.active') isActive = true;
    @HostBinding('class.active') isActive2 = true;
  `,
	componentWithComplexHostListener: `
  import { Component, HostListener } from '@angular/core';
  @Component({
    selector: 'my-complex-component',
    template: 'My complex component',
  })
  export class MyComplexComponent {
    @HostListener('document:keydown.escape', ['$event']) escapeKeydownHandler(event: KeyboardEvent): void {
    }

    @HostListener('mousedown', ['$event.target'])
    handleMousedown(target: any): void {
    }
    @HostListener('click', ['$event'])
    handleEventNoArgs(): void {
    }
  }
  `,
	componentWithNoHostBinding: `
  import { Component } from '@angular/core';

  @Component({
    selector: 'my-empty-component',
    template: 'My empty component',
  })
  export class MyEmptyComponent {
  }
  `,
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
	import { Directive, HostBinding, HostListener } from '@angular/core';

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
	abstractDirective: `
  import { Directive, HostBinding } from '@angular/core';

    @Directive()
    export abstract class MyDirective {
      @HostBinding('attr.active') readonly active = true;
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

	it('should convert properly for component with no host binding', async () => {
		const readContent = setup('componentWithNoHostBinding');
		await convertHostBindingGenerator(tree, options);

		const [updated] = readContent();
		expect(updated).toMatchSnapshot();
	});

	it('should convert properly for component with complex host listener', async () => {
		const readContent = setup('componentWithComplexHostListener');
		await convertHostBindingGenerator(tree, options);

		const [updated] = readContent();
		expect(updated).toMatchSnapshot();
	});

	it('should convert properly for component with duplicate host binding', async () => {
		const readContent = setup('componentWithDuplicateHostBinding');
		await convertHostBindingGenerator(tree, options);

		const [updated] = readContent();
		expect(updated).toMatchSnapshot();
	});

	it('should not crash for abstract directive', async () => {
		const readContent = setup('abstractDirective');
		await convertHostBindingGenerator(tree, options);

		const [updated] = readContent();
		expect(updated).toMatchSnapshot();
	});
});
