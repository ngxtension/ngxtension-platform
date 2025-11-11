import { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import convertToSFCGenerator from './generator';
import { ConvertToSFCGeneratorSchema } from './schema';

const template = `<div>Hello</div>
<app-my-cmp1>123</app-my-cmp1>`;

const styles = `h1 {
  color: red;
}`;

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
	componentWithTemplateUrlAndStyleUrls: `
import { Component, Input } from '@angular/core';

@Component({
  templateUrl: './my-file.html',
  styleUrls: ['./my-file.css']
})
export class MyCmp {
}
`,
	componentWithTemplateUrlAndStyleUrl: `
import { Component, Input } from '@angular/core';

@Component({
  templateUrl: './my-file.html',
  styleUrl: './my-file.css'
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

describe('convertToSFCGenerator', () => {
	let tree: Tree;
	const options: ConvertToSFCGeneratorSchema = {
		path: 'libs/my-file.ts',
		moveStyles: true,
		maxInlineTemplateLines: 10,
		maxInlineStyleLines: 10,
	};

	function setup(file: keyof typeof filesMap) {
		tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
		tree.write('package.json', `{"dependencies": {"@angular/core": "17.1.0"}}`);
		tree.write(`libs/my-file.ts`, filesMap[file]);
		tree.write(`libs/my-file.css`, styles);

		if (
			file === 'componentWithTemplateUrl' ||
			file === 'componentWithTemplateUrlAndStyleUrls' ||
			file === 'componentWithTemplateUrlAndStyleUrl'
		) {
			tree.write(`libs/my-file.html`, template);
			return () => {
				return [
					tree.read('libs/my-file.ts', 'utf8'),
					filesMap[file],
					tree.read('libs/my-file.html', 'utf8'),
					template,
					tree.read('libs/my-file.css', 'utf8'),
				];
			};
		}

		return () => {
			return [tree.read('libs/my-file.ts', 'utf8'), filesMap[file]];
		};
	}

	it('should not do anything if not component/directive', async () => {
		const readContent = setup('notComponent');
		await convertToSFCGenerator(tree, options);
		const [updated, original] = readContent();
		expect(updated).toEqual(original);
	});

	it('should not do anything if no template', async () => {
		const readContent = setup('componentNoTemplate');
		await convertToSFCGenerator(tree, options);
		const [updated, original] = readContent();
		expect(updated).toEqual(original);
	});

	it('should convert properly for templateUrl', async () => {
		const readContent = setup('componentWithTemplateUrl');
		await convertToSFCGenerator(tree, options);
		const [updated, , updatedHtml] = readContent();
		expect(updated).toMatchSnapshot();
		expect(updatedHtml).toMatchSnapshot();
	});

	it('should convert properly for templateUrl and styleUrls', async () => {
		const readContent = setup('componentWithTemplateUrlAndStyleUrls');
		await convertToSFCGenerator(tree, options);
		const [updated, , updatedHtml, updatedStyles] = readContent();
		expect(updated).toMatchSnapshot();
		expect(updatedHtml).toMatchSnapshot();
		expect(updatedStyles).toMatchSnapshot();
	});

	it('should convert properly for templateUrl and styleUrl', async () => {
		const readContent = setup('componentWithTemplateUrlAndStyleUrl');
		await convertToSFCGenerator(tree, options);
		const [updated, , updatedHtml, updatedStyles] = readContent();
		expect(updated).toMatchSnapshot();
		expect(updatedHtml).toMatchSnapshot();
		expect(updatedStyles).toMatchSnapshot();
	});

	it('should skip components with inline templates', async () => {
		const readContent = setup('componentWithInlineTemplate');
		await convertToSFCGenerator(tree, options);
		const [updated, , updatedHtml] = readContent();
		expect(updated).toMatchSnapshot();
		expect(updatedHtml).toMatchSnapshot();
	});
});
