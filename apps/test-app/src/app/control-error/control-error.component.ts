import { Component, inject } from '@angular/core';
import {
	FormBuilder,
	FormsModule,
	ReactiveFormsModule,
	Validators,
} from '@angular/forms';
import { NgxControlError } from 'ngxtension/control-error';

@Component({
	selector: 'ngxtension-platform-control-error',
	standalone: true,
	imports: [NgxControlError, FormsModule, ReactiveFormsModule],
	template: `
		<form [formGroup]="form">
			<legend>Personal Information</legend>

			<label>
				<b>Name</b>
				<input type="text" [formControl]="form.controls.name" />
				<strong *ngxControlError="form.controls.name; track: 'required'">
					Name is required.
				</strong>
			</label>

			<label>
				<b>Mail</b>
				<input type="email" [formControl]="form.controls.mail" />
				<strong *ngxControlError="form.controls.mail; track: 'required'">
					Mail is required.
				</strong>
				<strong *ngxControlError="form.controls.mail; track: 'email'">
					That seems to be not a valid mail :(
				</strong>
			</label>

			<button type="submit">Submit</button>
		</form>
	`,
})
export default class ControlErrorComponent {
	protected fb = inject(FormBuilder);

	protected form = this.fb.nonNullable.group({
		name: ['', Validators.required],
		mail: ['', [Validators.required, Validators.email]],
	});
}
