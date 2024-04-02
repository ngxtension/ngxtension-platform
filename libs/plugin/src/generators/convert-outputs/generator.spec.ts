import { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import convertOutputsGenerator from './generator';
import { ConvertOutputsGeneratorSchema } from './schema';

const filesMap = {
	notComponentNorDirective: `
import { Injectable } from '@angular/core';

@Injectable()
export class MyService {}
`,
	componentNoOutput: `
import { Component } from '@angular/core';

@Component({})
export class MyCmp {}
`,
	outputWithoutObservable: `
import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  template: \` \`
})
export class MyCmp {
  @Output() outputWithoutType = new EventEmitter();
  @Output() normalOutput = new EventEmitter<string>();
}
`,
	component: `
import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  template: \` \`
})
export class MyCmp {
  someObservable$ = of('test');

  @Output() outputWithoutType = new EventEmitter();
  @Output() normalOutput = new EventEmitter<string>();

  @Output() normalOutput2: EventEmitter<string> = new EventEmitter<string>();

  @Output() outputFromSubject = new Subject();
  @Output() outputFromBehaviorSubject = new BehaviorSubject<number>();

  @Output() withObservable = this.someObservable$;
  @Output('withAlias') aliasOutput = new EventEmitter<string>();

  ngOnInit() {
    let imABoolean = false;
    console.log(this.outputWithoutType);

    if (this.withTransform) {
      this.normalOutput.emit('test');
    }
  }

  handleClick() {
    if (true) {
      let test = this.outputWithoutType + this.normalOutput;
    }
  }
}
`,
} as const;

fdescribe('convertOutputsGenerator', () => {
	let tree: Tree;
	const options: ConvertOutputsGeneratorSchema = {
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

	it('should not do anything if not component/directive', async () => {
		const readContent = setup('notComponentNorDirective');
		await convertOutputsGenerator(tree, options);
		const [updated, original] = readContent();
		expect(updated).toEqual(original);
	});

	it('should not do anything if no input', async () => {
		const readContent = setup('componentNoOutput');
		await convertOutputsGenerator(tree, options);
		const [updated, original] = readContent();
		expect(updated).toEqual(original);
	});

	it('should convert properly', async () => {
		const readContent = setup('component');
		await convertOutputsGenerator(tree, options);
		const [updated] = readContent();
		expect(updated).toMatchSnapshot();
	});

	it('should not add outputFromObservable import if not needed', async () => {
		const readContent = setup('outputWithoutObservable');
		await convertOutputsGenerator(tree, options);
		const [updated] = readContent();
		expect(updated).toMatchSnapshot();
	});
});
