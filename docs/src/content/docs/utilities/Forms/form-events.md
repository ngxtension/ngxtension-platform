---
title: formEvents
description: Utilities for tracking and accessing Angular form control events and states as Observables or Signals
entryPoint: ngxtension/form-events
badge: stable
---

`allEventsSignal` and `allEventsObservable` combine everything you usually track about a reactive form control into one object: value, status, `valid`/`invalid`/`pending`, `touched`/`untouched`, `pristine`/`dirty` and the current errors. Use the signal version in templates and `computed()`, and the Observable version in RxJS pipelines, instead of merging `valueChanges`, `statusChanges` and `events` yourself.

## Usage

```angular-ts
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { allEventsSignal } from 'ngxtension/form-events';

@Component({
	selector: 'app-username',
	imports: [ReactiveFormsModule],
	template: `
		<input [formControl]="username" />

		@if (state().invalid && state().touched) {
			<p>Please enter a username.</p>
		}

		<p>Value: {{ state().value }} | Status: {{ state().status }} | Dirty: {{ state().dirty }}</p>
	`,
})
export class Username {
	username = new FormControl('', Validators.required);
	state = allEventsSignal(this.username);
}
```

`touched` and `pristine` are part of the state, so the template reacts to them too. With plain `valueChanges`/`statusChanges` you would miss a blur that only changes `touched`.

## With signals

Because the result is a signal, you can derive from it with `computed()` or react with `effect()`:

```ts
export class Signup {
	form = new FormGroup({
		name: new FormControl('', { nonNullable: true }),
		email: new FormControl('', {
			nonNullable: true,
			validators: Validators.email,
		}),
	});

	formState = allEventsSignal(this.form);

	canSubmit = computed(() => this.formState().valid && this.formState().dirty);

	constructor() {
		effect(() => console.log('Form value:', this.formState().value));
	}
}
```

Outside an injection context, pass an `Injector` as the second argument: `allEventsSignal(form, injector)`.

## With Observables

`allEventsObservable` emits the same object. Combine it with `takeUntilDestroyed()` to clean up the subscription.

```angular-ts
import { Component } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { allEventsObservable } from 'ngxtension/form-events';
import { debounceTime, filter } from 'rxjs';

@Component({
	selector: 'app-profile-form',
	imports: [ReactiveFormsModule],
	template: `
		<form [formGroup]="form">
			<input formControlName="name" />
			<input formControlName="email" type="email" />
		</form>
	`,
})
export class ProfileForm {
	form = new FormGroup({
		name: new FormControl(''),
		email: new FormControl(''),
	});

	constructor() {
		allEventsObservable(this.form)
			.pipe(
				filter((state) => state.valid && state.dirty),
				debounceTime(500),
				takeUntilDestroyed(),
			)
			.subscribe((state) => this.autosave(state.value));
	}

	autosave(value: typeof this.form.value) {
		/* ... */
	}
}
```

## API

```ts
function allEventsSignal<T>(
	form: AbstractControl<T>,
	injector?: Injector,
): Signal<FormEventData<T>>;

function allEventsObservable<T>(
	form: AbstractControl<T>,
): Observable<FormEventData<T>>;

type FormEventData<T> = {
	value: T; // form.getRawValue(), includes disabled controls
	status: FormControlStatus; // 'VALID' | 'INVALID' | 'PENDING' | 'DISABLED'
	valid: boolean;
	invalid: boolean;
	pending: boolean;
	touched: boolean;
	untouched: boolean;
	pristine: boolean;
	dirty: boolean;
	controlErrors: ValidationErrors | null;
};
```

| Parameter  | Type              | Description                                                                       |
| ---------- | ----------------- | --------------------------------------------------------------------------------- |
| `form`     | `AbstractControl` | A `FormControl`, `FormGroup` or `FormArray`.                                      |
| `injector` | `Injector`        | Only for `allEventsSignal`. Use it when you call it outside an injection context. |

### Notes

- `value` uses `getRawValue()`, so values of disabled controls are included.
- Value changes are compared with `JSON.stringify`, so setting an equal object doesn't count as a new value. Status, touched and pristine events are passed through as they happen.
- `controlErrors` holds `form.errors` for a `FormControl` or `FormArray`. For a `FormGroup`, it holds an object with the errors of each direct child control, keyed by control name (`null` for valid children).
- `controlErrors` is recalculated when the value changes. Errors set later without a value change (for example by an async validator) show up after the next value change.
- `allEventsObservable` emits the current state as soon as you subscribe. `allEventsSignal` starts with the current state of the control.
