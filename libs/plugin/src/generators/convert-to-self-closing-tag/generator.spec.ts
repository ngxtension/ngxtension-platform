import { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import convertToSelfClosingTagGenerator from './generator';
import { ConvertToSelfClosingTagGeneratorSchema } from './schema';

const template = `
<div>Hello</div>
<app-my-cmp1>123</app-my-cmp1>
<app-my-cmp1>123</app-my-cmp1>
<app-my-cmp2 test="hello">123</app-my-cmp2>
<app-my-cmp3
  test="hello">
  123
</app-my-cmp3>
<app-my-cmp4
  test="hello"
>
  123
</app-my-cmp4>
<app-my-cmp5
  test="hello"
>
  123
</app-my-cmp5>
<app-my-cmp10 test="hello"
  [test]="hello"
  (test)="hello()"
>
</app-my-cmp10>

<app-my-cmp11
  test="hello"
  [test]="hello"
  (test)="hello()"
>
</app-my-cmp11>
<app-my-cmp12 test="hello"
>


</app-my-cmp12>
<input type="text" />

<app-my-cmp6 />
<app-my-cmp7 test="hello" />

<hello-world></hello-world>

<pagination count="1" [test]="hello" (test)="test"></pagination>

<pagination count="1" />

<hello-world></hello-world>

<hello-world12>
  <hello-world13>
    <hello-world14 count="1" [test]="hello" (test)="test" ></hello-world14>
      <hello-world15>
        <hello-world16  count="1" [test]="hello" (test)="test"  />
        <hello-world17  count="1" [test]="hello" (test)="test" ></hello-world17>
        <hello-world18
         count="1" [test]="hello"
          (test)="test"
          >

        </hello-world18>
      </hello-world15>
  </hello-world13>
</hello-world12>

<app-management
  *ngIf="
    categoryList &&
    ((test1 && test1.length > 0) ||
    (test && test.length > 0))
  "
  [test]="test > 2"
  [test]="test"
  (testEvent)="test.length > 0 ? test($event) : null"
  (testEvent2)="test1($event)"></app-management>
`;

const filesMap = {
	notComponent: `
import { Injectable } from '@angular/core';

@Injectable()
export class MyService {}
`,
	componentNoTemplate: `
import { Component } from '@angular/core';

@Component({})
export class MyCmp {}
`,

	componentWithTemplateUrl: `
import { Component, Input } from '@angular/core';

@Component({
  templateUrl: './my-file.html'
})
export class MyCmp {
}
`,

	componentWithInlineTemplate: `
import { Component, Input } from '@angular/core';

@Component({
  template: \`
    <router-outlet></router-outlet>
  \`
})
export class MyCmp {
}
`,
} as const;

describe('convertToSelfClosingTagGenerator', () => {
	let tree: Tree;
	const options: ConvertToSelfClosingTagGeneratorSchema = {
		path: 'libs/my-file.ts',
	};

	function setup(file: keyof typeof filesMap) {
		tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
		tree.write('package.json', `{"dependencies": {"@angular/core": "17.1.0"}}`);
		tree.write(`libs/my-file.ts`, filesMap[file]);

		if (file === 'componentWithTemplateUrl') {
			tree.write(`libs/my-file.html`, template);
			return () => {
				return [
					tree.read('libs/my-file.ts', 'utf8'),
					filesMap[file],
					tree.read('libs/my-file.html', 'utf8'),
					template,
				];
			};
		}

		return () => {
			return [tree.read('libs/my-file.ts', 'utf8'), filesMap[file]];
		};
	}

	it('should not do anything if not component/directive', async () => {
		const readContent = setup('notComponent');
		await convertToSelfClosingTagGenerator(tree, options);
		const [updated, original] = readContent();
		expect(updated).toEqual(original);
	});

	it('should not do anything if no template', async () => {
		const readContent = setup('componentNoTemplate');
		await convertToSelfClosingTagGenerator(tree, options);
		const [updated, original] = readContent();
		expect(updated).toEqual(original);
	});

	it('should convert properly for templateUrl', async () => {
		const readContent = setup('componentWithTemplateUrl');
		await convertToSelfClosingTagGenerator(tree, options);
		const [updated, , updatedHtml] = readContent();
		expect(updated).toMatchSnapshot();
		expect(updatedHtml).toMatchSnapshot();
	});

	it('should convert properly for inline template', async () => {
		const readContent = setup('componentWithInlineTemplate');
		await convertToSelfClosingTagGenerator(tree, options);
		const [updated, , updatedHtml] = readContent();
		expect(updated).toMatchSnapshot();
		expect(updatedHtml).toMatchSnapshot();
	});
});
