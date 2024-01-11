import { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import convertSignalInputsGenerator from './generator';
import { ConvertSignalInputsGeneratorSchema } from './schema';

const filesMap = {
	notComponentNorDirective: `
import { Injectable } from '@angular/core';

@Injectable()
export class MyService {}
`,
	componentNoInput: `
import { Component } from '@angular/core';

@Component({})
export class MyCmp {}
`,
	component: `
import { Component, Input } from '@angular/core';

@Component({})
export class MyCmp {
  @Input() normalInput = '';
  @Input() withoutDefault?: string;
  @Input() withoutDefaultUnion: string | undefined;
  @Input({ alias: 'defaultAlias' }) withDefaultAlias = 123;
  @Input({ alias: 'noDefaultAlias'}) withoutDefaultAlias?: number;
  @Input('stringAlias') justAStringAlias = '';
  @Input({ transform: booleanAttribute }) withTransform: string | '' = false;
  @Input({ required: true }) requiredInput!: string;
  @Input({ required: true, alias: 'requiredAlias' }) requiredWithAlias!: boolean;
  @Input({ required: true, alias: 'transformedRequiredAlias', transform: numberAttribute }) requiredWithAliasAndTransform!: string | '';

  @Input() set leaveMeAlone(value: number) {
    console.log('setter', value);
  }
}
`,
} as const;

const output = `import { Component, Input } from '@angular/core';
import { input } from "@angular/core";
@Component({})
export class MyCmp {
    @Input()
    set leaveMeAlone(value: number) {
        console.log('setter', value);
    }
    normalInput = input('');
    withoutDefault = input<string | undefined>();
    withoutDefaultUnion = input<string | undefined>();
    withDefaultAlias = input(123, { alias: 'defaultAlias' });
    withoutDefaultAlias = input<number | undefined>(undefined, { alias: 'noDefaultAlias' });
    justAStringAlias = input('', { alias: 'stringAlias' });
    withTransform = input<boolean, string | ''>(false, { transform: booleanAttribute });
    requiredInput = input.required<string>();
    requiredWithAlias = input.required<boolean>({ alias: 'requiredAlias' });
    requiredWithAliasAndTransform = input.required<number, string | ''>({ alias: 'transformedRequiredAlias', transform: numberAttribute });
    ;
    ;
    ;
    ;
    ;
    ;
    ;
    ;
    ;
    ;
}
`;

describe('convertSignalInputsGenerator', () => {
	let tree: Tree;
	const options: ConvertSignalInputsGeneratorSchema = {
		path: 'libs/my-file.ts',
	};

	function setup(file: keyof typeof filesMap) {
		tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
		tree.write('package.json', `{"dependencies": {"@angular/core": "17.1.0"}}`);
		tree.write(`libs/my-file.ts`, filesMap[file]);

		return () => {
			return [tree.read('libs/my-file.ts', 'utf8'), filesMap[file]];
		};
	}

	it('should not do anything if not component/directive', async () => {
		const readContent = setup('notComponentNorDirective');
		await convertSignalInputsGenerator(tree, options);
		const [updated, original] = readContent();
		expect(updated).toEqual(original);
	});

	it('should not do anything if no input', async () => {
		const readContent = setup('componentNoInput');
		await convertSignalInputsGenerator(tree, options);
		const [updated, original] = readContent();
		expect(updated).toEqual(original);
	});

	it('should convert properly', async () => {
		const readContent = setup('component');
		await convertSignalInputsGenerator(tree, options);
		const [updated] = readContent();
		expect(updated).toEqual(output);
	});
});
