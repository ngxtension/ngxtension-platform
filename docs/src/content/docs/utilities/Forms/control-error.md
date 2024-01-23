---
title: NgxControlError
description: Structural directive for displaying form control errors consistently and reduce boilerplate.
entryPoint: control-error
badge: stable
contributors: ['robby-rabbitman']
---

`NgxControlError` is a structural directive for displaying form control errors consistently while reducing boilerplate.

## Import

```typescript
import { NgxControlError } from 'ngxtension/control-error';
```

## Usage

```html
<label>
	<b>Name</b>
	<input type="text" [formControl]="name" />
	<strong *ngxControlError="name; track: 'required'">Name is required.</strong>
</label>
```

The template will be rendered, when the control is in an [_error state_](#configuration) and its errors include the tracked error(s).

without `NgxControlError`:

```html
<label>
	<b>Name</b>
	<input type="text" [formControl]="name" />
	@if (name.hasError('required') && (name.touched || form.submitted)) {
	<strong>Name is required.</strong>
	}
</label>
```

## Configuration

A `StateMatcher` defines when the provided control is in an _error state_.
A `StateMatcher` is a function which returns an observable. Every time the `StateMatcher` emits a value, the directive checks whether it should render or hide its template:
The directive renders its template when the `StateMatcher` emits `true` and the errors of the control include at least 1 tracked error, else its template will be hidden.

```ts
export type StateMatcher = (
	control: AbstractControl,
	parent?: FormGroupDirective | NgForm,
) => Observable<boolean>;
```

Per default the control is considered in an _error state_ when 1. its status is `INVALID` and 2. it is `touched` or its form has been `submitted`.

You can override this behavior:

```ts
/**
 * A control is in an error state when its status is invalid.
 * Emits whenever statusChanges emits.
 * You may want to add more sources, such as valueChanges.
 */
export const customErrorStateMatcher: StateMatcher = (control) =>
	control.statusChanges.pipe(
		startWith(control.status),
		map((status) => status === 'INVALID'),
	);
```

### Via DI

```ts
provideNgxControlError({ errorStateMatcher: customErrorStateMatcher });
```

### Via Input

```html
<label>
	<b>Name</b>
	<input type="text" [formControl]="name" />
	<strong
		*ngxControlError="name; track: 'required'; errorStateMatcher: customErrorStateMatcher"
	>
		Name is required.
	</strong>
</label>
```

## Integration

### [NGX Translate](https://github.com/ngx-translate/core)

You can iterate over all possible errors and pass the `errors` to the translate pipe:

```html
<label>
	<b>Mail</b>
	<input type="email" [formControl]="mail" />
	@for (error of ['required', 'email', 'myCustomError']; track error) {
	<strong *ngxControlError="mail; track: error">
		{{ "PATH.TO.MAIL_CONTROL.ERRORS." + error | translate: mail.errors }}
	</strong>
	}
</label>
```

### [Angular Material](https://github.com/angular/components)

```html
<mat-form-field>
	<mat-label>Name</mat-label>
	<input matInput [formControl]="name" />
	<mat-error *ngxControlError="name; track: 'required'">
		Name is required.
	</mat-error>
</mat-form-field>
```
