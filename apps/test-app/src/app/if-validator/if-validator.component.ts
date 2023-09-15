import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ifValidator } from 'ngxtension/if-validator';

@Component({
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule],
	host: {
		style: 'display: block; margin: 12px',
	},
	template: `
		<input [formControl]="form" />

		<pre>Is Form Valid: {{ form.valid }}</pre>

		<button (click)="changeCondition()">Change Form Condition</button>
	`,
})
export default class IfValidator {
	public shouldValidate = false;
	public form = new FormControl(
		null,
		ifValidator(
			() => this.shouldValidate,
			[Validators.required, Validators.email]
		)
	);

	public changeCondition() {
		this.shouldValidate = !this.shouldValidate;
		this.form.updateValueAndValidity();
	}
}
