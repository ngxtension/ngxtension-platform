import { AsyncPipe, JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { allEventsObservable, allEventsSignal } from 'ngxtension/form-events';

@Component({
	selector: 'ngxtension-platform-intl',
	standalone: true,
	imports: [ReactiveFormsModule, JsonPipe, AsyncPipe],
	template: `
		<form [formGroup]="form">
			<label for="firstName">Name</label>
			<input formControlName="firstName" name="firstName" />

			<label for="lastName">Name</label>
			<input formControlName="lastName" name="lastName" />

			<br />

			<button type="reset">Reset</button>
		</form>
		<pre>{{ $form() | json }}</pre>
		<pre>{{ form$ | async | json }}</pre>
	`,
})
export default class FormEventsComponent {
	fb = inject(NonNullableFormBuilder);
	form = this.fb.group({
		firstName: this.fb.control(''),
		lastName: this.fb.control(''),
	});

	form$ = allEventsObservable(this.form);
	$form = allEventsSignal(this.form);
}
