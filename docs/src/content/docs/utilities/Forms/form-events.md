---
title: formEvents
description: Utilities for tracking and accessing Angular form control events and states as Observables or Signals
entryPoint: ngxtension/form-events
badge: stable
---

## Import

```typescript
import { allEventsObservable, allEventsSignal } from 'ngxtension/form-events';
```

## Usage

The form-events utilities provide a convenient way to react to all form control events and state changes using either RxJS Observables or Angular Signals.

```typescript
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { allEventsSignal } from 'ngxtension/form-events';

@Component({
	selector: 'my-app',
	standalone: true,
	imports: [ReactiveFormsModule],
	template: `
		<input [formControl]="nameControl" />
		<div>Value: {{ formState().value }}</div>
		<div>Valid: {{ formState().valid }}</div>
		<div>Dirty: {{ formState().dirty }}</div>
		<div>Touched: {{ formState().touched }}</div>
	`,
})
export class App {
	nameControl = new FormControl('');
	formState = allEventsSignal(this.nameControl);
}
```

### Examples

#### Using with Observables

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { allEventsObservable } from 'ngxtension/form-events';
import { Subscription } from 'rxjs';

@Component({
	selector: 'my-app',
	standalone: true,
	imports: [ReactiveFormsModule],
	template: `
		<form [formGroup]="form">
			<input formControlName="name" />
			<input formControlName="email" type="email" />
		</form>
	`,
})
export class App implements OnInit, OnDestroy {
	form = new FormGroup({
		name: new FormControl(''),
		email: new FormControl(''),
	});

	private subscription = new Subscription();

	ngOnInit() {
		this.subscription.add(
			allEventsObservable(this.form).subscribe((state) => {
				console.log('Form value:', state.value);
				console.log('Form valid:', state.valid);
				console.log('Form dirty:', state.dirty);
				console.log('Form touched:', state.touched);
			}),
		);
	}

	ngOnDestroy() {
		this.subscription.unsubscribe();
	}
}
```

#### Using with Signals

```typescript
import { Component, effect } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { allEventsSignal } from 'ngxtension/form-events';

@Component({
	selector: 'my-app',
	standalone: true,
	imports: [ReactiveFormsModule],
	template: `
		<input [formControl]="usernameControl" />
		<div *ngIf="formState().invalid && formState().dirty">
			Please enter a valid username
		</div>
	`,
})
export class App {
	usernameControl = new FormControl('', [Validators.required]);
	formState = allEventsSignal(this.usernameControl);

	constructor() {
		effect(() => {
			// React to any form state changes
			const state = this.formState();
			if (state.valid && state.dirty) {
				console.log('Username is valid:', state.value);
			}
		});
	}
}
```

## API

### Functions

#### `allEventsObservable<T>(form: AbstractControl<T>): Observable<FormEventData<T>>`

Creates an Observable that emits the form state data whenever any form event occurs (value, status, touched, or pristine changes).

#### `allEventsSignal<T>(form: AbstractControl<T>): Signal<FormEventData<T>>`

Creates a Signal that contains the form state data and updates whenever any form event occurs.

### Return Type - `FormEventData<T>`

Both functions return the same data structure with the following properties:

```typescript
type FormEventData<T> = {
	value: T; // The current form value
	status: FormControlStatus; // 'VALID', 'INVALID', 'PENDING', or 'DISABLED'
	touched: boolean; // Whether the form has been touched
	pristine: boolean; // Whether the form is pristine (hasn't been modified)
	valid: boolean; // Whether the form is valid
	invalid: boolean; // Whether the form is invalid
	pending: boolean; // Whether validation is pending
	dirty: boolean; // Whether the form is dirty (has been modified)
	untouched: boolean; // Whether the form is untouched
};
```

### Notes

- Works with any AbstractControl (FormControl, FormGroup, or FormArray)
- The Observable/Signal emits only when there are actual changes to the form state
- The `value` property uses `getRawValue()` to get the complete form value, including disabled controls
- Value comparison uses JSON.stringify to detect changes in object/array values
