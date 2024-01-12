import { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import convertSignalInputsGenerator from './generator';
import { ConvertSignalInputsGeneratorSchema } from './schema';

const template = `<div>{{ inputWithoutType }}</div>

<div [id]="normalInput">{{ withoutDefault }}</div>

@if (withoutDefaultUnion) {
  <app-test [acceptsString]="withoutDefaultUnion" />

  @if (withoutDefaultAlias) {
    <app-test [acceptsString]="withoutDefaultAlias || withoutDefaultUnion" />
  }
}

<ng-container *ngIf="withDefaultAlias">
  <app-test [acceptsString]="withDefaultAlias" />

  <ng-container *ngIf="withoutDefaultAlias">
    <app-test [acceptsString]="withoutDefaultAlias || withDefaultAlias" />
  </ng-container>
</ng-container>`;

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

@Component({
  template: \`
    ${template}
  \`
})
export class MyCmp {
  @Input() inputWithoutType;
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

  ngOnInit() {
    let imABoolean = false;
    console.log(this.justAStringAlias);

    if (this.withTransform) {
      imABoolean = this.withTransform;
    }
  }

  handleClick() {
    if (this.requiredInput) {
      let test = this.requiredInput + this.requiredWithAlias;
    } else {
      let test = this.requiredWithAliasAndTransform + this.requiredWithAlias;
    }
  }
}
`,
	componentWithTemplateUrl: `
import { Component, Input } from '@angular/core';

@Component({
  templateUrl: './my-file.html'
})
export class MyCmp {
  @Input() inputWithoutType;
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

  ngOnInit() {
    let imABoolean = false;
    console.log(this.justAStringAlias);

    if (this.withTransform) {
      imABoolean = this.withTransform;
    }
  }

  handleClick() {
    if (this.requiredInput) {
      let test = this.requiredInput + this.requiredWithAlias;
    } else {
      let test = this.requiredWithAliasAndTransform + this.requiredWithAlias;
    }
  }
}
`,
} as const;

const output = `import { Component, Input, input } from '@angular/core';
import { input } from '@angular/core';
@Component({
  template: \`
    <div>{{ inputWithoutType() }}</div>

    <div [id]="normalInput()">{{ withoutDefault() }}</div>

    @if (withoutDefaultUnion()) {
      <app-test [acceptsString]="withoutDefaultUnion()!" />

      @if (withoutDefaultAlias()) {
        <app-test [acceptsString]="withoutDefaultAlias()! || withoutDefaultUnion()!" />
      }
    }

    <ng-container *ngIf="withDefaultAlias()">
      <app-test [acceptsString]="withDefaultAlias()" />

      <ng-container *ngIf="withoutDefaultAlias()">
        <app-test [acceptsString]="withoutDefaultAlias() || withDefaultAlias()" />
      </ng-container>
    </ng-container>
  \`
})
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


  ngOnInit() {
    let imABoolean = false;
    console.log(this.justAStringAlias());

    if (this.withTransform()) {
      imABoolean = this.withTransform()!;
    }
  }

  handleClick() {
    if (this.requiredInput()) {
      let test = this.requiredInput() + this.requiredWithAlias();
    } else {
      let test = this.requiredWithAliasAndTransform() + this.requiredWithAlias();
    }
  }
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
		expect(updated).toMatchSnapshot();
	});

	it.only('should convert properly for templateUrl', async () => {
		const readContent = setup('componentWithTemplateUrl');
		await convertSignalInputsGenerator(tree, options);
		const [updated, , updatedHtml] = readContent();
		expect(updated).toMatchSnapshot();
		expect(updatedHtml).toMatchSnapshot();
	});
});
