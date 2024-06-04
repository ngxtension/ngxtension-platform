import { AsyncPipe, JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
	NonNullableFormBuilder,
	ReactiveFormsModule,
	Validators,
} from '@angular/forms';
import { By } from '@angular/platform-browser';
import { allEventsObservable, allEventsSignal } from 'ngxtension/form-events';

function flattenJsonPipeFormatting(str: string | null) {
	return str?.replace(/\s/g, '');
}
describe('Form Events', () => {
	it('returns a signal with the initial value, status, pristine, and touched values of a form', async () => {
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
                "lastName": ""
            },
            "status": "INVALID",
            "touched": false,
            "pristine": true,
            "valid": false,
            "invalid": true,
            "pending": false,
            "dirty": false,
            "untouched": true
            }`),
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
                "lastName": ""
            },
            "status": "INVALID",
            "touched": false,
            "pristine": true,
            "valid": false,
            "invalid": true,
            "pending": false,
            "dirty": false,
            "untouched": true
            }`),
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
                "lastName": ""
            },
            "status": "VALID",
            "touched": true,
            "pristine": false,
            "valid": true,
            "invalid": false,
            "pending": false,
            "dirty": true,
            "untouched": false
            }`),
		);
	});

	it('returns a signal with the value, status, pristine, and touched values of a form after it has been interacted with', async () => {
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
                "lastName": ""
            },
            "status": "VALID",
            "touched": true,
            "pristine": false,
            "valid": true,
            "invalid": false,
            "pending": false,
            "dirty": true,
            "untouched": false
            }`),
		);
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

			<br />

			<button type="reset">Reset</button>
		</form>

		<pre data-testid="signal-values">{{ $form() | json }}</pre>
		<pre data-testid="observable-values">{{ form$ | async | json }}</pre>
	`,
})
export default class FormEventsComponent {
	fb = inject(NonNullableFormBuilder);
	form = this.fb.group({
		firstName: this.fb.control('', Validators.required),
		lastName: this.fb.control(''),
	});

	form$ = allEventsObservable(this.form);
	$form = allEventsSignal(this.form);
}
