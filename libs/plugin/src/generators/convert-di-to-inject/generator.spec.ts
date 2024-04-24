import { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import convertDiToInjectGenerator from './generator';
import { ConvertDiToInjectGeneratorSchema } from './schema';

const filesMap = {
	notComponentNorDirective: `
	  export class MyClass {
      constructor() {}
    }
  `,
	componentNoConstructor: `
    import { Component } from '@angular/core';
    @Component({
      template: ''
    })
    export class MyComponent {}
  `,
	componentWithDep: `
    import { Component, Optional, Attribute, ElementRef } from '@angular/core';
    @Component({
      template: ''
    })
    export class MyComponent {
      constructor(
        private service: MyService,
        private readonly service2: ElementRef<HtmlImageElement>,
        @Optional() @Attribute('type') type: string,
      ) {}
    }
  `,
	componentWithDepUsage: `
    import { Component } from '@angular/core';
    @Component({
      template: ''
    })
    export class MyComponent {
      constructor(
        private service: MyService
        private readonly service1: MyService1<string>
      ) {
        this.service.doSomething();
      }
    }
  `,
	componentWithDepUsageLocal: `
    import { Component } from '@angular/core';
    @Component({
      template: ''
    })
    export class MyComponent {
      constructor(service: MyService) {
        service.doSomething();
      }
    }
  `,
	componentWithDepUsageLocalNoScope: `
    import { Component } from '@angular/core';
    @Component({
      template: ''
    })
    export class MyComponent {
      constructor(service: MyService) {
        service.doSomething();

        someList.forEach(() => {
          // nested scope
          service.doSomething();
        });

        // use service in a function call
        someFunction(service);
      }
    }
  `,
	componentWithConstructorWithoutDep: `
    import { Component } from '@angular/core';
    @Component({
      template: ''
    })
    export class MyComponent {
      constructor() {
        console.log('hello');
      }
    }`,
	componentWithDepAndInject: `
    import { Component, Inject, Attribute, Optional } from '@angular/core';
    @Component({
      template: ''
    })
    export class MyComponent {
      service3: MyService3;

      constructor(
        @Attribute('type') private type: string,
        @Inject('my-service') private service: MyService,
        @Inject(MyService4) private service4: MyService4,
        @Optional() @Inject('my-service2') private service5: MyService5,
        private service2: MyService2,
        service3: MyService3
      ) {
        this.service3 = service3;
      }
    }
`,
	componentWithDepAndInjectAndOptions: `
    import { Component, Inject, Optional, Self } from '@angular/core';
    @Component({
      template: ''
    })
    export class MyComponent {
      constructor(
        private myService: MyService,
        private elRef: ElementRef<HtmlImageElement>,
        private tplRef: TemplateRef<any>,
        private viewContainerRef: ViewContainerRef,
        service2: MyService2,
        @Inject('my-service') private service: MyService,
        @Inject(MyService4) private service4: MyService4,
        @Optional() @Inject('my-service2') private service5: MyService5,
        @Self() @Optional() private service6: MyService6,
      ) {
        myService.doSomething();

        this.service2.doSomethingElse();

        service2.doSomething();

        someList.forEach(() => {
          // nested scope
          myService.doSomething();
        });

        // use service in a function call
        someFunction(service2).test(myService);
      }
    }
`,
} as const;

// cases
// file without constructor injection or not a component/directive/pipe/injectable
// file with component but no constructor
// file with component and constructor without dependencies
// file with component and constructor with dependencies
// file with component and constructor with dependencies and @Inject() decorator on constructor
// @Inject() decorator on constructor with string literal
// file with component and constructor with dependencies that don't have type

// remove empty constructor if it's empty and has empty body

describe('convertDiToInjectGenerator', () => {
	let tree: Tree;
	const options: ConvertDiToInjectGeneratorSchema = {
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

	it('should not do anything if not component/directive/pipe/injectable', async () => {
		const readContent = setup('notComponentNorDirective');
		await convertDiToInjectGenerator(tree, options);
		const [updated, original] = readContent();
		expect(updated).toEqual(original);
	});

	it('should not do anything if no constructor', async () => {
		const readContent = setup('componentNoConstructor');
		await convertDiToInjectGenerator(tree, options);
		const [updated, original] = readContent();
		expect(updated).toEqual(original);
	});

	it('should convert properly', async () => {
		const readContent = setup('componentWithDep');
		await convertDiToInjectGenerator(tree, options);
		const [updated] = readContent();
		expect(updated).toMatchSnapshot();
	});

	it('should convert properly with usage', async () => {
		const readContent = setup('componentWithDepUsage');
		await convertDiToInjectGenerator(tree, options);
		const [updated] = readContent();
		expect(updated).toMatchSnapshot();
	});

	it('should convert properly with usage local', async () => {
		const readContent = setup('componentWithDepUsageLocal');
		await convertDiToInjectGenerator(tree, options);
		const [updated] = readContent();
		expect(updated).toMatchSnapshot();
	});

	it('should convert properly with usage local no scope', async () => {
		const readContent = setup('componentWithDepUsageLocalNoScope');
		await convertDiToInjectGenerator(tree, options);
		const [updated] = readContent();
		expect(updated).toMatchSnapshot();
	});

	it('should not do anything if constructor without dep', async () => {
		const readContent = setup('componentWithConstructorWithoutDep');
		await convertDiToInjectGenerator(tree, options);
		const [updated, original] = readContent();
		expect(updated).toEqual(original);
	});

	it('should not do anything if no dep', async () => {
		const readContent = setup('componentWithConstructorWithoutDep');
		await convertDiToInjectGenerator(tree, options);
		const [updated] = readContent();
		expect(updated).toMatchSnapshot();
	});

	it('should convert properly with @Inject decorator', async () => {
		const readContent = setup('componentWithDepAndInject');
		await convertDiToInjectGenerator(tree, options);
		const [updated] = readContent();
		expect(updated).toMatchSnapshot();
	});

	it('should convert properly with @Inject decorator and options', async () => {
		const readContent = setup('componentWithDepAndInjectAndOptions');
		await convertDiToInjectGenerator(tree, options);
		const [updated] = readContent();
		expect(updated).toMatchSnapshot();
	});
});
