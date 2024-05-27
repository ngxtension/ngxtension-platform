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
			<label for="name">Name</label>
			<input formControlName="name" name="name" />
		</form>
		<pre>{{ $form | json }}</pre>
		<pre>{{ form$ | async | json }}</pre>
	`,
})
export default class IntlComponent {
	fb = inject(NonNullableFormBuilder);
	form = this.fb.group({
		name: this.fb.control(''),
	});

	form$ = allEventsObservable(this.form);
	$form = allEventsSignal(this.form);
}
