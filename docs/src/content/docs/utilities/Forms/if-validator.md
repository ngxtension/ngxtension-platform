---
title: ifValidator / ifAsyncValidator
description: Utility functions to dynamically change the validation of Angular's Reactive Form.
entryPoint: ngxtension/if-validator
badge: stable
contributors: ['tomer']
---

`ifValidator` and `ifAsyncValidator` wrap validators so they only run when a condition is true. Use them for rules like "the company name is required only for business accounts" without adding and removing validators by hand.

## Usage

```angular-ts
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ifValidator } from 'ngxtension/if-validator';

@Component({
	selector: 'app-email',
	imports: [ReactiveFormsModule],
	template: `
		<label>
			<input type="checkbox" (change)="toggleValidation()" [checked]="shouldValidate" />
			Validate email
		</label>
		<input [formControl]="email" />
		<p>Valid: {{ email.valid }}</p>
	`,
})
export class EmailField {
	shouldValidate = true;

	email = new FormControl(
		'',
		ifValidator(() => this.shouldValidate, [Validators.required, Validators.email]),
	);

	toggleValidation() {
		this.shouldValidate = !this.shouldValidate;
		this.email.updateValueAndValidity(); // re-run the validators
	}
}
```

When the condition returns `false`, the control is valid as far as these validators are concerned. You can pass one validator or an array.

:::caution[Re-validate when the condition changes]
Angular only runs validators when the control's value changes. When your condition changes, call `updateValueAndValidity()` on the control so it is checked again.
:::

## Depend on another control

The condition receives the control being validated, so you can read its parent form. Here the company name is required only for business accounts:

```ts
form = new FormGroup({
	accountType: new FormControl<'personal' | 'business'>('personal'),
	companyName: new FormControl(
		'',
		ifValidator(
			(control) => control.parent?.get('accountType')?.value === 'business',
			Validators.required,
		),
	),
});

constructor() {
	this.form.controls.accountType.valueChanges
		.pipe(takeUntilDestroyed())
		.subscribe(() => this.form.controls.companyName.updateValueAndValidity());
}
```

## Async validators

`ifAsyncValidator` does the same for one async validator. When the condition is `false`, it returns `of(null)` without calling the validator.

```ts
username = new FormControl('', {
	asyncValidators: ifAsyncValidator(
		(control) => control.value.length >= 3,
		usernameAvailableValidator,
	),
});
```

## API

```ts
function ifValidator(
	condition: (control: FormControl) => boolean,
	validatorFn: ValidatorFn | ValidatorFn[],
): ValidatorFn;

function ifAsyncValidator(
	condition: (control: FormControl) => boolean,
	validatorFn: AsyncValidatorFn,
): AsyncValidatorFn;
```

| Parameter     | Type                                                | Description                                                                                  |
| ------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `condition`   | `(control: FormControl) => boolean`                 | Called on every validation with the control. The validators run only when it returns `true`. |
| `validatorFn` | `ValidatorFn \| ValidatorFn[]` / `AsyncValidatorFn` | The validator(s) to apply. An array is combined with `Validators.compose`.                   |
