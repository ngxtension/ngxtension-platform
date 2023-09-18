---
title: ifValidator / ifAsyncValidator
description: ngxtension/if-validator
---

`ifValidator` or `ifAsyncValidator` are simple utility functions for help to change dynamically validation of Angular Reactive Form

```ts
import { ifValidator } from 'ngxtension/if-validation';
```

## Usage

`ifValidator` accepts a callback condition and `ValidatorFn` or `ValidatorFn[]`.

```ts
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ifValidator } from 'ngxtension/if-validator';

@Component({
	selector: 'my-app',
	standalone: true,
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
		ifValidator(() => this.shouldValidate, [Validators.required, Validators.email])
	);

	public changeCondition() {
		this.shouldValidate = !this.shouldValidate;
		this.form.updateValueAndValidity();
	}
}
```
