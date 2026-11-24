import { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import * as ts from 'typescript';

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

describe('convertToSFCGenerator edge cases', () => {
	let tree: Tree;
	const options: ConvertToSFCGeneratorSchema = {
		path: 'libs/my-file.ts',
		moveStyles: true,
		maxInlineTemplateLines: 10,
		maxInlineStyleLines: 10,
	};

	function setup(component: string, files: Record<string, string>) {
		tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
		tree.write('package.json', `{"dependencies": {"@angular/core": "17.1.0"}}`);
		tree.write('libs/my-file.ts', component);
		for (const [path, content] of Object.entries(files)) {
			tree.write(path, content);
		}
	}

	/** Returns the runtime (cooked) string values of the template literals in the decorator property. */
	function readInlinedValues(source: string, propertyName: string) {
		const sourceFile = ts.createSourceFile(
			'my-file.ts',
			source,
			ts.ScriptTarget.Latest,
			true,
		);
		const diagnostics = (
			sourceFile as unknown as { parseDiagnostics: ts.Diagnostic[] }
		).parseDiagnostics;
		expect(diagnostics.map((d) => d.messageText)).toEqual([]);

		const values: string[] = [];
		const visit = (node: ts.Node) => {
			if (
				ts.isPropertyAssignment(node) &&
				ts.isIdentifier(node.name) &&
				node.name.text === propertyName
			) {
				const collect = (expr: ts.Node) => {
					if (ts.isNoSubstitutionTemplateLiteral(expr)) values.push(expr.text);
					else expr.forEachChild(collect);
				};
				collect(node.initializer);
			}
			node.forEachChild(visit);
		};
		visit(sourceFile);
		return values;
	}

	it('should inline every file of a styleUrls array with several entries', async () => {
		setup(
			`
import { Component } from '@angular/core';

@Component({
  templateUrl: './my-file.html',
  styleUrls: ['./my-file.css', './my-other-file.css']
})
export class MyCmp {}
`,
			{
				'libs/my-file.html': '<h1>Hi</h1>',
				'libs/my-file.css': 'h1 { color: red; }',
				'libs/my-other-file.css': 'h2 { color: blue; }',
			},
		);

		await convertToSFCGenerator(tree, options);

		const updated = tree.read('libs/my-file.ts', 'utf8');
		expect(updated).not.toContain('styleUrls');
		const styles = readInlinedValues(updated, 'styles').map((s) => s.trim());
		expect(styles).toEqual(['h1 { color: red; }', 'h2 { color: blue; }']);
		expect(tree.exists('libs/my-file.css')).toBe(false);
		expect(tree.exists('libs/my-other-file.css')).toBe(false);
	});

	it('should leave styleUrls alone when one of the files does not exist', async () => {
		const component = `
import { Component } from '@angular/core';

@Component({
  templateUrl: './my-file.html',
  styleUrls: ['./my-file.css', './missing.css']
})
export class MyCmp {}
`;
		setup(component, {
			'libs/my-file.html': '<h1>Hi</h1>',
			'libs/my-file.css': 'h1 { color: red; }',
		});

		await convertToSFCGenerator(tree, options);

		expect(tree.read('libs/my-file.ts', 'utf8')).toContain(
			`styleUrls: ['./my-file.css', './missing.css']`,
		);
		expect(tree.exists('libs/my-file.css')).toBe(true);
	});

	it('should leave templateUrl alone when the template file does not exist', async () => {
		const component = `
import { Component } from '@angular/core';

@Component({
  templateUrl: './missing.html'
})
export class MyCmp {}
`;
		setup(component, {});

		await convertToSFCGenerator(tree, options);

		const updated = tree.read('libs/my-file.ts', 'utf8');
		expect(updated).toContain(`templateUrl: './missing.html'`);
		expect(updated).not.toContain('template:');
	});

	it.each([
		['backticks', '<code>`npm i`</code>'],
		['backslashes', '<input pattern="\\d+" />'],
	])('should keep %s intact when inlining a template', async (_, html) => {
		setup(
			`
import { Component } from '@angular/core';

@Component({
  templateUrl: './my-file.html'
})
export class MyCmp {}
`,
			{ 'libs/my-file.html': html },
		);

		await convertToSFCGenerator(tree, options);

		const updated = tree.read('libs/my-file.ts', 'utf8');
		expect(updated).not.toContain('templateUrl');
		expect(readInlinedValues(updated, 'template')).toEqual([`\n${html}\n`]);
	});

	it('should escape backslashes when inlining styles', async () => {
		const css = `blockquote::before { content: "\\201C"; }`;
		setup(
			`
import { Component } from '@angular/core';

@Component({
  templateUrl: './my-file.html',
  styleUrl: './my-file.css'
})
export class MyCmp {}
`,
			{ 'libs/my-file.html': '<h1>Hi</h1>', 'libs/my-file.css': css },
		);

		await convertToSFCGenerator(tree, options);

		const updated = tree.read('libs/my-file.ts', 'utf8');
		expect(updated).not.toContain('styleUrl');
		expect(readInlinedValues(updated, 'styles')).toEqual([`\n${css}\n`]);
	});

	it('should move styles of a component that already has an inline template', async () => {
		setup(
			`
import { Component } from '@angular/core';

@Component({
  template: '<h1>Hi</h1>',
  styleUrl: './my-file.css'
})
export class MyCmp {}
`,
			{ 'libs/my-file.css': 'h1 { color: red; }' },
		);

		await convertToSFCGenerator(tree, options);

		const updated = tree.read('libs/my-file.ts', 'utf8');
		expect(updated).not.toContain('styleUrl');
		expect(readInlinedValues(updated, 'styles')).toEqual([
			'\nh1 { color: red; }\n',
		]);
		expect(tree.exists('libs/my-file.css')).toBe(false);
	});

	it('should not touch styleUrl when moveStyles is off', async () => {
		const component = `
import { Component } from '@angular/core';

@Component({
  template: '<h1>Hi</h1>',
  styleUrl: './my-file.css'
})
export class MyCmp {}
`;
		setup(component, { 'libs/my-file.css': 'h1 { color: red; }' });

		await convertToSFCGenerator(tree, { ...options, moveStyles: false });

		expect(tree.read('libs/my-file.ts', 'utf8')).toEqual(component);
		expect(tree.exists('libs/my-file.css')).toBe(true);
	});
});
