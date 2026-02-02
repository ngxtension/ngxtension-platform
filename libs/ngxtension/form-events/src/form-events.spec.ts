import { AsyncPipe, JsonPipe } from '@angular/common';
import { Component, inject, Injector, OnInit, Signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
	FormControlStatus,
	NonNullableFormBuilder,
	ReactiveFormsModule,
	Validators,
} from '@angular/forms';
import { By } from '@angular/platform-browser';
import { firstValueFrom, Observable } from 'rxjs';
import { allEventsObservable, allEventsSignal } from '../src/form-events';

function flattenJsonPipeFormatting(str: string | null) {
	return str?.replace(/\s/g, '');
}
describe('Form Events', () => {
	it('returns a signal with the initial value, status, pristine, and touched values of a form and the control errors', async () => {
		const fixture: ComponentFixture<FormEventsComponent> =
			TestBed.configureTestingModule({
				imports: [FormEventsComponent],
			}).createComponent(FormEventsComponent);

		fixture.detectChanges();

		const signalVals: HTMLElement = fixture.debugElement.query(
			By.css('[data-testid="signal-values"]'),
		).nativeElement;

		expect(flattenJsonPipeFormatting(signalVals.textContent)).toBe(
			flattenJsonPipeFormatting(`            {
            "value": {
                "firstName": "",
                "lastName": "",
                "email": "",
                "age": ""
            },
            "status": "INVALID",
            "touched": false,
            "pristine": true,
            "valid": false,
            "invalid": true,
            "pending": false,
            "dirty": false,
            "untouched": true,
            "controlErrors": {
              "firstName": {
                "required": true
              },
              "lastName": null,
              "email": {
                "required": true
              },
              "age": {
                "required": true
              }
            }}`),
		);
	});

	it('returns an observable with the initial value, status, pristine, and touched values of a form', async () => {
		const fixture: ComponentFixture<FormEventsComponent> =
			TestBed.configureTestingModule({
				imports: [FormEventsComponent],
			}).createComponent(FormEventsComponent);

		fixture.detectChanges();

		const signalVals: HTMLElement = fixture.debugElement.query(
			By.css('[data-testid="observable-values"]'),
		).nativeElement;

		expect(flattenJsonPipeFormatting(signalVals.textContent)).toBe(
			flattenJsonPipeFormatting(`            {
            "value": {
                "firstName": "",
                "lastName": "",
                "email": "",
                "age": ""
            },
            "status": "INVALID",
            "touched": false,
            "pristine": true,
            "valid": false,
            "invalid": true,
            "pending": false,
            "dirty": false,
            "untouched": true,
            "controlErrors": {
              "firstName": {
                "required": true
              },
              "lastName": null,
              "email": {
                "required": true
              },
              "age": {
                "required": true
              }
            }}`),
		);
	});

	it('returns a signal with the value, status, pristine, and touched values of a form after it has been interacted with', async () => {
		const fixture: ComponentFixture<FormEventsComponent> =
			TestBed.configureTestingModule({
				imports: [FormEventsComponent],
			}).createComponent(FormEventsComponent);

		fixture.detectChanges();

		const signalVals: HTMLElement = fixture.debugElement.query(
			By.css('[data-testid="signal-values"]'),
		).nativeElement;

		const formFirstNameInput: HTMLInputElement =
			fixture.debugElement.nativeElement
				.querySelector('#test-form')
				.querySelectorAll('input')[0];

		formFirstNameInput.focus();
		formFirstNameInput.value = 'Jerry';
		formFirstNameInput.dispatchEvent(new Event('input'));
		formFirstNameInput.blur();

		fixture.detectChanges();

		expect(flattenJsonPipeFormatting(signalVals.textContent)).toBe(
			flattenJsonPipeFormatting(`{
            "value": {
                "firstName": "Jerry",
                "lastName": "",
                "email": "",
                "age": ""
            },
            "status": "INVALID",
            "touched": true,
            "pristine": false,
            "valid": false,
            "invalid": true,
            "pending": false,
            "dirty": true,
            "untouched": false,
            "controlErrors": {
              "firstName": null,
              "lastName": null,
              "email": {
                "required": true
              },
              "age": {
                "required": true
              }
            }}`),
		);
	});

	it('returns an observable with the value, status, pristine, and touched values of a form after it has been interacted with', async () => {
		const fixture: ComponentFixture<FormEventsComponent> =
			TestBed.configureTestingModule({
				imports: [FormEventsComponent],
			}).createComponent(FormEventsComponent);

		fixture.detectChanges();

		const signalVals: HTMLElement = fixture.debugElement.query(
			By.css('[data-testid="observable-values"]'),
		).nativeElement;

		const formFirstNameInput: HTMLInputElement =
			fixture.debugElement.nativeElement
				.querySelector('#test-form')
				.querySelectorAll('input')[0];

		formFirstNameInput.focus();
		formFirstNameInput.value = 'Jerry';
		formFirstNameInput.dispatchEvent(new Event('input'));
		formFirstNameInput.blur();

		fixture.detectChanges();

		expect(flattenJsonPipeFormatting(signalVals.textContent)).toBe(
			flattenJsonPipeFormatting(`{
            "value": {
                "firstName": "Jerry",
                "lastName": "",
                "email": "",
                "age": ""
            },
            "status": "INVALID",
            "touched": true,
            "pristine": false,
            "valid": false,
            "invalid": true,
            "pending": false,
            "dirty": true,
            "untouched": false,
            "controlErrors": {
              "firstName": null,
              "lastName": null,
              "email": {
                "required": true
              },
              "age": {
                "required": true
              }
            }}`),
		);
	});

	it('returns both a signal and observable value with correct initial value once the value was set in an ngOnInit', async () => {
		const fixture: ComponentFixture<FormEventsComponent> =
			TestBed.configureTestingModule({
				imports: [FormEventsComponent],
			}).createComponent(FormEventsComponent);

		fixture.detectChanges();

		const observableVals: HTMLElement = fixture.debugElement.query(
			By.css('[data-testid="observable-values-initial-value-overwritten"]'),
		).nativeElement;

		expect(flattenJsonPipeFormatting(observableVals.textContent)).toBe(
			flattenJsonPipeFormatting(`{
            "value": {
                "name": "custom",
                "email": "email@example.com",
                "age": "21"
            },
            "status": "VALID",
            "touched": false,
            "pristine": true,
            "valid": true,
            "invalid": false,
            "pending": false,
            "dirty": false,
            "untouched": true,
            "controlErrors": {
              "name":null,
              "email":null,
              "age":null
            }
            }`),
		);

		const signalVals: HTMLElement = fixture.debugElement.query(
			By.css('[data-testid="signal-values-initial-value-overwritten"]'),
		).nativeElement;

		expect(flattenJsonPipeFormatting(signalVals.textContent)).toBe(
			flattenJsonPipeFormatting(`{
            "value": {
                "name": "custom",
                "email": "email@example.com",
                "age": "21"
            },
            "status": "VALID",
            "touched": false,
            "pristine": true,
            "valid": true,
            "invalid": false,
            "pending": false,
            "dirty": false,
            "untouched": true,
            "controlErrors": {
              "name":null,
              "email":null,
              "age":null
            }
            }`),
		);
	});

	it('returns both a signal and observable value with correct initial value once the value was set in an ngOnInit with Error', async () => {
		const fixture: ComponentFixture<FormEventsComponent> =
			TestBed.configureTestingModule({
				imports: [FormEventsComponent],
			}).createComponent(FormEventsComponent);

		const expected = {
			value: {
				name: 'custom',
				email: 'email@example.com',
				age: '',
			},
			status: 'INVALID',
			touched: false,
			pristine: true,
			valid: false,
			invalid: true,
			pending: false,
			dirty: false,
			untouched: true,
			controlErrors: {
				name: null,
				email: null,
				age: {
					required: true,
				},
			},
		};

		fixture.detectChanges();

		const observableVals: HTMLElement = fixture.debugElement.query(
			By.css(
				'[data-testid="observable-values-initial-value-overwritten-with-error"]',
			),
		).nativeElement;

		expect(flattenJsonPipeFormatting(observableVals.textContent)).toBe(
			JSON.stringify(expected),
		);

		const signalVals: HTMLElement = fixture.debugElement.query(
			By.css(
				'[data-testid="signal-values-initial-value-overwritten-with-error"]',
			),
		).nativeElement;

		expect(flattenJsonPipeFormatting(signalVals.textContent)).toBe(
			JSON.stringify(expected),
		);
	});

	it('returns a value of controls or the whole form even if they are disabled', async () => {
		const fixture: ComponentFixture<FormEventsComponent> =
			TestBed.configureTestingModule({
				imports: [FormEventsComponent],
			}).createComponent(FormEventsComponent);

		fixture.detectChanges();

		const observableVals: HTMLElement = fixture.debugElement.query(
			By.css('[data-testid="observable-values-disabled"]'),
		).nativeElement;
		const signalVals: HTMLElement = fixture.debugElement.query(
			By.css('[data-testid="signal-values-disabled"]'),
		).nativeElement;

		const formDisabledButton: HTMLInputElement =
			fixture.debugElement.nativeElement.querySelector('#formDisable');
		const formEnabledButton: HTMLInputElement =
			fixture.debugElement.nativeElement.querySelector('#formEnable');
		const controlDisabledButton: HTMLInputElement =
			fixture.debugElement.nativeElement.querySelector('#controlDisable');

		const formValue = `{
            "value": {
                "name": ""
            },
            "status": "DISABLED",
            "touched": false,
            "pristine": true,
            "valid": false,
            "invalid": false,
            "pending": false,
            "dirty": false,
            "untouched": true,
            "controlErrors": {
              "name":null
            }
            }`;

		formDisabledButton.click();
		fixture.detectChanges();

		expect(flattenJsonPipeFormatting(observableVals.textContent)).toBe(
			flattenJsonPipeFormatting(formValue),
		);
		expect(flattenJsonPipeFormatting(signalVals.textContent)).toBe(
			flattenJsonPipeFormatting(formValue),
		);

		formEnabledButton.click();
		controlDisabledButton.click();
		fixture.detectChanges();
		expect(flattenJsonPipeFormatting(observableVals.textContent)).toBe(
			flattenJsonPipeFormatting(formValue),
		);
		expect(flattenJsonPipeFormatting(signalVals.textContent)).toBe(
			flattenJsonPipeFormatting(formValue),
		);
	});
});

type FormEventData = {
	value: string;
	status: FormControlStatus;
	touched: boolean;
	pristine: boolean;
	valid: boolean;
	invalid: boolean;
	pending: boolean;
	dirty: boolean;
	untouched: boolean;
};
describe('works in ngOnInit by passing an Injector', () => {
	@Component({ standalone: true, template: '' })
	class InInitComponent implements OnInit {
		injector = inject(Injector);
		fb = inject(NonNullableFormBuilder);
		data!: Signal<FormEventData>;
		data$!: Observable<FormEventData>;
		form = this.fb.control('');

		ngOnInit() {
			this.data$ = allEventsObservable<string>(this.form);
			this.data = allEventsSignal<string>(this.form, this.injector);
		}
	}

	let component: InInitComponent;

	beforeEach(async () => {
		const fixture = TestBed.createComponent(InInitComponent);
		component = fixture.componentInstance;
	});

	it('should not throw an error', async () => {
		const expected = {
			value: '1',
			status: 'VALID',
			touched: false,
			pristine: true,
			valid: true,
			invalid: false,
			pending: false,
			dirty: false,
			untouched: true,
			controlErrors: null,
		};
		component.ngOnInit();
		component.form.patchValue('1');
		expect(component.data()).toStrictEqual(expected);

		const result = await firstValueFrom(component.data$);
		expect(result).toStrictEqual(expected);
	});

	it('should return with errors', async () => {
		const expected = {
			value: '',
			status: 'INVALID',
			touched: false,
			pristine: true,
			valid: false,
			invalid: true,
			pending: false,
			dirty: false,
			untouched: true,
			controlErrors: {
				required: true,
			},
		};
		component.ngOnInit();
		component.form.addValidators(Validators.required);
		component.form.updateValueAndValidity();
		expect(component.data()).toStrictEqual(expected);

		const result = await firstValueFrom(component.data$);
		expect(result).toStrictEqual(expected);
	});
});

@Component({
	standalone: true,
	imports: [ReactiveFormsModule, JsonPipe, AsyncPipe],
	template: `
		<form [formGroup]="form" id="test-form">
			<label for="firstName">First Name</label>
			<input
				data-testid="firstName"
				formControlName="firstName"
				name="firstName"
			/>

			<label for="lastName">Last Name</label>
			<input
				data-testid="lastName"
				formControlName="lastName"
				name="lastName"
			/>
			<label for="age">Last Name</label>
			<input data-testid="age" formControlName="age" name="age" />
			<label for="email">Last Name</label>
			<input data-testid="email" formControlName="email" name="email" />

			<br />

			<button type="reset">Reset</button>
		</form>

		<pre data-testid="signal-values">{{ $form() | json }}</pre>
		<pre data-testid="observable-values">{{ form$ | async | json }}</pre>

		<form
			[formGroup]="formInitialValueOverwritten"
			id="test-form-initial-value-overwritten"
		>
			<label for="firstName">Name</label>
			<input data-testid="name" formControlName="name" name="name" />
			<input data-testid="age" formControlName="age" name="age" />
			<input data-testid="email" formControlName="email" name="email" />
		</form>

		<form
			[formGroup]="formInitialValueOverwritten"
			id="test-form-initial-value-overwritten-with-error"
		>
			<label for="firstName">Name</label>
			<input data-testid="name" formControlName="name" name="name" />
			<input data-testid="age" formControlName="age" name="age" />
			<input data-testid="email" formControlName="email" name="email" />
		</form>

		<button (click)="setFormDisabledState('formDisable')" id="formDisable">
			Disable formDisabled
		</button>
		<button (click)="setFormDisabledState('formEnable')" id="formEnable">
			Enable formDisabled
		</button>
		<button
			(click)="setFormDisabledState('controlDisable')"
			id="controlDisable"
		>
			Disable formDisabled's control
		</button>

		<pre data-testid="signal-values-initial-value-overwritten">{{
			$formInitialValuesOverwritten() | json
		}}</pre>
		<pre data-testid="observable-values-initial-value-overwritten">{{
			formInitialValuesOverwritten$ | async | json
		}}</pre>
		<pre data-testid="signal-values-initial-value-overwritten-with-error">{{
			$formInitialValuesOverwrittenWithError() | json
		}}</pre>
		<pre data-testid="observable-values-initial-value-overwritten-with-error">{{
			formInitialValuesOverwrittenWithError$ | async | json
		}}</pre>

		<form [formGroup]="formDisabled" id="test-form-disabled">
			<label for="firstName">Name</label>
			<input data-testid="name" formControlName="name" name="name" />
		</form>

		<pre data-testid="signal-values-disabled">{{ $formDisabled() | json }}</pre>
		<pre data-testid="observable-values-disabled">{{
			formDisabled$ | async | json
		}}</pre>
	`,
})
export default class FormEventsComponent implements OnInit {
	fb = inject(NonNullableFormBuilder);
	form = this.fb.group({
		firstName: this.fb.control('', Validators.required),
		lastName: this.fb.control(''),
		email: this.fb.control('', [Validators.required, Validators.email]),
		age: this.fb.control('', [Validators.min(18), Validators.required]),
	});

	formInitialValueOverwritten = this.fb.group({
		name: this.fb.control(''),
		email: this.fb.control('', [Validators.required, Validators.email]),
		age: this.fb.control('', [Validators.min(18), Validators.required]),
	});

	formInitialValueOverwrittenError = this.fb.group({
		name: this.fb.control('', [Validators.required]),
		email: this.fb.control('', [Validators.required, Validators.email]),
		age: this.fb.control('', [Validators.min(18), Validators.required]),
	});

	formDisabled = this.fb.group({
		name: this.fb.control(''),
	});

	form$ = allEventsObservable(this.form);
	$form = allEventsSignal(this.form);

	formInitialValuesOverwritten$ = allEventsObservable(
		this.formInitialValueOverwritten,
	);
	$formInitialValuesOverwritten = allEventsSignal(
		this.formInitialValueOverwritten,
	);

	formInitialValuesOverwrittenWithError$ = allEventsObservable(
		this.formInitialValueOverwrittenError,
	);
	$formInitialValuesOverwrittenWithError = allEventsSignal(
		this.formInitialValueOverwrittenError,
	);

	formDisabled$ = allEventsObservable(this.formDisabled);
	$formDisabled = allEventsSignal(this.formDisabled);

	ngOnInit() {
		this.formInitialValueOverwritten.controls.name.setValue('custom');
		this.formInitialValueOverwritten.controls.email.setValue(
			'email@example.com',
		);
		this.formInitialValueOverwritten.controls.age.setValue('21');

		this.formInitialValueOverwrittenError.controls.name.setValue('custom');
		this.formInitialValueOverwrittenError.controls.email.setValue(
			'email@example.com',
		);
	}

	setFormDisabledState(type: 'formDisable' | 'formEnable' | 'controlDisable') {
		switch (type) {
			case 'formDisable':
				this.formDisabled.disable();
				break;
			case 'formEnable':
				this.formDisabled.enable();
				break;
			case 'controlDisable':
				this.formDisabled.controls.name.disable();
				break;
		}
	}
}
