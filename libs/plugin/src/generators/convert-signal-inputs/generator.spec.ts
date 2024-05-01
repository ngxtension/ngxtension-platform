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
</ng-container>

<div>
  @for (item of normalInput; track item.id) {
     <app-test [normalInput]="item.name" />
  }
</div>

<test [normalInput]="normalInput" />
<test-normalInput />
<normalInput />
<another-component something="blah-normalInput" />

<a normalInput [routerLink]="['test-normalInput', '/normalInput' , normalInput, 'normalInput']">
 normalInput - {{ normalInput }}
 {{ normalInput }}  normalInput
 {{ 'normalInput' }} - normalInput
 {{ normalInput + 'normalInput' }} - normalInput
 <span>{{ 'normalInput' + normalInput }}</span>
</a>

<button (click)="normalInput = 123"></button>
<button (click)="normalInput = 'normalInput'"></button>
<button (click)="someFunctionWithnormalInput('normalInput', normalInput)"></button>
<button (normalInput)="someFunctionWithnormalInput(normalInput, 'normalInput')"></button>
<button (eventWithnormalInput)="test = 'normalInput' + normalInput"></button>

<a>
 {{ 'someNormalTextnormalInput' | translate: 'normalInput' }}

 {{ normalInput | translate: normalInput }}
 {{ normalInput | translate: 'normalInput' }}
 {{ 'normalInput' | translate: 'normalInput' }}
 {{ 'normalInput' | translate: normalInput }}
</a>

<input [(ngModel)]="normalInput" />
<cmp name="normalInput"></cmp>
<cmp [name]="normalInput"></cmp>
<cmp name="withnormalInput"></cmp>
<cmp normalInput="normalInput"></cmp>

<p>{{ data().normalInput }}</p>
`;

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
	shouldRemoveOldImportAndAppendNewOne: `
import { Component, Input } from '@angular/core';

@Component({})
export class MyCmp {
  @Input() hello: string;
}
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
  /*
   * @description I go with requiredWithAliasAndTransform
   */
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

    const ternary = this.withoutDefault ? this.withoutDefault.toString() : null;
    const optional = this.withoutDefaultAlias?.toString() || null;
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
	issue236: `
@Component({
  selector: 'app-request-info',
  templateUrl: './request-info.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    AsyncPipe,
    NgIf,
  ],
})
export class RequestInfoComponent implements OnInit {
  #formBuilder = inject(NonNullableFormBuilder);
  #lookuper = inject(AddressLookuper);

  formGroup = this.#formBuilder.group({
    address: [''],
  });
  title = 'Request More Information';
  @Input() address = '';
  submitter$ = new Subject<void>();
  lookupResult$: Observable<string> | undefined;

  ngOnInit(): void {
    if (this.address) {
      this.formGroup.setValue({ address: this.address });
    }

    this.lookupResult$ = this.submitter$.pipe(
      switchMap(() => {
        assertDefined(this.formGroup.value.address);
        return this.#lookuper.lookup(this.formGroup.value.address);
      }),
      map((found) => (found ? 'Brochure sent' : 'Address not found')),
    );
  }

  search(): void {
    this.submitter$.next();
  }
}`,
	issue290: `
import { Component, Input } from '@angular/core';

@Component({})
export class MyCmp {
  @Input() inputWithoutType;
  noColon = true
}
`,
} as const;

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

	it('should convert properly for templateUrl', async () => {
		const readContent = setup('componentWithTemplateUrl');
		await convertSignalInputsGenerator(tree, options);
		const [updated, , updatedHtml] = readContent();
		expect(updated).toMatchSnapshot();
		expect(updatedHtml).toMatchSnapshot();
	});

	it('should remove old import and append new one', async () => {
		const readContent = setup('shouldRemoveOldImportAndAppendNewOne');
		await convertSignalInputsGenerator(tree, options);
		const [updated, , updatedHtml] = readContent();
		expect(updated).toMatchSnapshot();
		expect(updatedHtml).toMatchSnapshot();
	});

	it('should convert properly for issue #236', async () => {
		const readContent = setup('issue236');
		await convertSignalInputsGenerator(tree, options);
		const [updated] = readContent();
		expect(updated).toMatchSnapshot();
	});

	it('should fail for issue #290', async () => {
		const readContent = setup('issue290');
		await expect(async () => {
			await convertSignalInputsGenerator(tree, options);
			readContent();
		}).rejects.toThrow();
	});
});
