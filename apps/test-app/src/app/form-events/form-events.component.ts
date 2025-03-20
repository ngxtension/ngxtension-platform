import { AsyncPipe, JsonPipe } from '@angular/common';
import { Component, inject, Injector, OnInit } from '@angular/core';
import {
	NonNullableFormBuilder,
	ReactiveFormsModule,
	Validators,
} from '@angular/forms';
import { allEventsObservable, allEventsSignal } from 'ngxtension/form-events';

@Component({
	selector: 'ngxtension-platform-intl',
	standalone: true,
	imports: [ReactiveFormsModule, JsonPipe, AsyncPipe],
	template: `
		<label for="control">Control</label>
		<input placeholder="Control" [formControl]="control" />
		<pre>{{ controlData$ | async | json }}</pre>
		<pre>{{ controlData() | json }}</pre>

		<hr />

		<form [formGroup]="form">
			<label for="firstName">First Name</label>
			<input formControlName="firstName" name="firstName" />
			@if (form.controls.firstName.errors?.['required']) {
				<p>First name is required</p>
			}

			<label for="lastName">Last Name</label>
			<input formControlName="lastName" name="lastName" />

			<label for="email">Email</label>
			<input formControlName="email" name="email" />
			@if (form.controls.email.errors?.['required']) {
				<p>Email is required</p>
			}
			@if (form.controls.email.errors?.['email']) {
				<p>Email is invalid</p>
			}

			<label for="age">Age</label>
			<input formControlName="age" name="age" />
			@if (form.controls.age.errors?.['min']) {
				<p>Age must be at least 18</p>
			}
			@if (form.controls.age.errors?.['required']) {
				<p>Age is required</p>
			}

			<br />

			<button type="reset">Reset</button>
		</form>
		<pre>{{ $form() | json }}</pre>
		<pre>{{ form$ | async | json }}</pre>
	`,
})
export default class FormEventsComponent implements OnInit {
	fb = inject(NonNullableFormBuilder);
	injector = inject(Injector);
	form = this.fb.group({
		firstName: this.fb.control('', Validators.required),
		lastName: this.fb.control(''),
		email: this.fb.control('', [Validators.required, Validators.email]),
		age: this.fb.control('', [Validators.min(18), Validators.required]),
	});
	form$ = allEventsObservable(this.form);
	$form = allEventsSignal(this.form);

	controlData!: any;
	controlData$!: any;
	control = this.fb.control('', Validators.required);

	formTyped$ = allEventsObservable<ReturnType<typeof this.form.getRawValue>>(
		this.form,
	);
	$formTyped = allEventsSignal<ReturnType<typeof this.form.getRawValue>>(
		this.form,
	);
	ngOnInit() {
		this.controlData$ = allEventsObservable<string>(this.control);
		this.controlData = allEventsSignal<string>(this.control, this.injector);
	}
}
