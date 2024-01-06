---
title: ifValidator / ifAsyncValidator
description: Utility functions to dynamically change the validation of Angular's Reactive Form.
badge: stable
contributor: tomer
---

## Import

```typescript
import { ifValidator, ifAsyncValidator } from 'ngxtension/if-validator';
```

## Usage

### ifValidator

Use `ifValidator` to apply conditional form validation. It accepts a callback condition and `ValidatorFn` or `ValidatorFn[]`.

```typescript
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ifValidator } from 'ngxtension/if-validator';

@Component({
	selector: 'my-app',
	imports: [CommonModule, ReactiveFormsModule],
	template: `
		<input [formControl]="form" />
		<div>Is Form Valid: {{ form.valid }}</div>
		<button (click)="changeCondition()">Change Form Condition</button>
	`,
})
export class App {
	public shouldValidate = true;
	public form = new FormControl(
		null,
		ifValidator(
			() => this.shouldValidate,
			[Validators.required, Validators.email],
		),
	);

	public changeCondition() {
		this.shouldValidate = !this.shouldValidate;
		this.form.updateValueAndValidity();
	}
}
```

### ifAsyncValidator

Similar to `ifValidator` but for asynchronous validation.

## API

### Inputs for ifValidator

- `condition: (control: FormControl) => boolean` - A callback to determine whether the validators should be applied.
- `validatorFn: ValidatorFn | ValidatorFn[]` - The validation function(s) to use.

### Inputs for ifAsyncValidator

- `condition: (control: FormControl) => boolean` - A callback to determine whether the asynchronous validator should be applied.
- `validatorFn: AsyncValidatorFn` - The asynchronous validation function to use.
