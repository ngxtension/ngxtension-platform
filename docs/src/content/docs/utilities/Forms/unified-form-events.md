---
title: Unified Form Events
description: .
entryPoint: form-events
badge: stable
contributors: ['michael-small']
---

Unified Form Events expose as much reactive form state as possible, as both an observable or a signal.
Like reacting to `.valueChanges()` or `.statusChanges()`, this utility is based on the new [unified form events API](https://github.com/angular/angular/pull/54579) introduced in Angular 18.

`allEventsObservable` and `allEventsSignal` are exposed as an `Observable` and readonly `Signal`
with the following typing.

```ts
type FormEventData<T> = {
	// So about this... see "Usage" to why this is in effect `Partial<T>`,
	// and the last section for one approach to avoid this using `signalSlice`.
	value: T;

	status: FormControlStatus;
	touched: boolean;
	pristine: boolean;
	valid: boolean;
	invalid: boolean;
	pending: boolean;
	dirty: boolean;
	untouched: boolean;
};
```

The form events API also exposes events for submitted and reset, but those are not included
in this utility as they do not have value accessors.

## Import

```typescript
import { allEventsObservable, allEventsSignal } from 'ngxtension/form-events';
```

## Usage

> DISCLAIMER:
> Due to some constraints of reactive forms, the value ends up resolving when implemented as `Partial<T>`. However, most if not all edge cases are accounted for, so in the author's opinion and personal use it should be safe to assert it as non-Partial as users see fit. See discussion in this utility's [pull request](https://github.com/ngxtension/ngxtension-platform/pull/391) and a [related issue](https://github.com/ngxtension/ngxtension-platform/issues/365). The author's favorite way to use this form utility and to type the value is explained in the last documentation subsection, ["Synergy with `signalSlice`"](#synergy-with-`signalSlice`).

[Stackblitz example](https://stackblitz.com/edit/stackblitz-starters-masfsq?file=src%2Fform-events-utils.ts) of both functions.

### `allEventsObservable`

```ts
export class App {
	fb = inject(NonNullableFormBuilder);
	form = this.fb.group({
		firstName: this.fb.control('', Validators.required),
		lastName: this.fb.control(''),
	});
	form$ = allEventsObservable(this.form);
}
```

### `allEventsSignal`

```ts
export class App {
	fb = inject(NonNullableFormBuilder);
	form = this.fb.group({
		firstName: this.fb.control('', Validators.required),
		lastName: this.fb.control(''),
	});
	$form = allEventsSignal(this.form);
}
```

## Synergy with `signalSlice` - removing the `Partial` from `Partial<T>` and more

This form events utility was inspired by ngxtensions's [`signalSlice`](https://ngxtension.netlify.app/utilities/signals/signal-slice/) creator Josh Morony. Josh outlines this approach in his video ["A trick to make your Angular Reactive Forms more... _Reactive_"](https://www.youtube.com/watch?v=cxoew5rmwFM&t=211s). Rather than the `formValues` util that Josh provides in the `signalSlice` `sources` array, you can provide `allEventsObservable(this.form)`.

`signalSlice` does some type magic that allows the user to assert that the `Partial` from `Partial<T>` will only be `T` in effect. The typing of the `signalSlice` is infered from it's `initialState` parameter, and the value for type `T` can be specified with:

```ts
initialFormState = {
	...this.form.getRawValue(), // `.getRawValue()` gets around the `Partial` limitiation
	// ...
};

formState = signalSlice({
	initialState: this.initialFormState, // The form's value will be `T`
	sources: [allEventsObservable(this.form)],
	// ...
});
```
