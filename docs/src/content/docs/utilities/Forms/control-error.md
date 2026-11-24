---
title: NgxControlError
description: Structural directive for displaying form control errors consistently and reduce boilerplate.
entryPoint: ngxtension/control-error
badge: stable
contributors: ['robby-rabbitman']
---

`NgxControlError` is a structural directive that shows its template only when a form control has a given error and is in an _error state_ (by default: invalid and touched, or its form was submitted). It replaces the repeated `@if (ctrl.hasError('x') && (ctrl.touched || form.submitted))` checks in your templates and keeps the rule for "when do we show errors" in one place.

## Usage

```angular-ts
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxControlError } from 'ngxtension/control-error';

@Component({
	selector: 'app-name-field',
	imports: [ReactiveFormsModule, NgxControlError],
	template: `
		<label>
			<b>Name</b>
			<input type="text" [formControl]="name" />
			<strong *ngxControlError="name; track: 'required'">Name is required.</strong>
		</label>
	`,
})
export class NameField {
	name = new FormControl('', Validators.required);
}
```

The message appears after the user leaves the empty field (or submits the form), and disappears as soon as the field is valid. Without `NgxControlError` you would write:

```html
@if (name.hasError('required') && (name.touched || form.submitted)) {
<strong>Name is required.</strong>
}
```

## Use a control name inside a form

Inside a `[formGroup]`, pass the name of the control instead of the instance.

```html
<form [formGroup]="form">
	<input type="text" formControlName="name" />
	<strong *ngxControlError="'name'; track: 'required'">
		Name is required.
	</strong>
</form>
```

It throws if there is no parent form group, or if no control has that name.

## Track several errors

`track` accepts an array. The template renders when the control has at least one of them.

```html
<strong *ngxControlError="email; track: ['required', 'email']">
	Enter a valid email address.
</strong>
```

## Read the error details

The template context exposes the control's `errors` as the implicit value, plus `control` and `track`. Use it to show values from the error object, like the required length.

```html
<strong *ngxControlError="password; track: 'minlength'; let errors">
	At least {{ errors['minlength'].requiredLength }} characters.
</strong>
```

## Change when errors are shown

A `StateMatcher` decides when a control is in an _error state_. It is a function that returns an Observable of `boolean`. The template renders when the matcher emits `true` **and** the control has one of the tracked errors.

```ts
export type StateMatcher = (
	control: AbstractControl,
	parent?: FormGroupDirective | NgForm,
) => Observable<boolean>;
```

The default matcher (`NGX_DEFAULT_CONTROL_ERROR_STATE_MATCHER`) emits `true` when the control is `INVALID` and either `touched` or its parent form has been submitted. Here is a matcher that shows errors as soon as the control is invalid:

```ts
import { map, startWith } from 'rxjs';
import type { StateMatcher } from 'ngxtension/control-error';

export const showErrorsImmediately: StateMatcher = (control) =>
	control.statusChanges.pipe(
		startWith(control.status),
		map((status) => status === 'INVALID'),
	);
```

### For a whole component or app

`provideNgxControlError` takes a **factory** that returns the matcher, so you can use `inject()` inside it.

```ts
bootstrapApplication(App, {
	providers: [
		provideNgxControlError({ errorStateMatcher: () => showErrorsImmediately }),
	],
});
```

### For one usage

```html
<strong
	*ngxControlError="name; track: 'required'; errorStateMatcher: showErrorsImmediately"
>
	Name is required.
</strong>
```

## Error messages outside the form element

The "submitted" part of the default matcher comes from the closest `FormGroupDirective` or `NgForm`, which is injected automatically. If the message is rendered outside the `<form>` element (for example in a summary at the top of the page), nothing can be injected, so pass the form with `parent`:

```html
<strong
	*ngxControlError="form.controls.name; track: 'required'; parent: formDir"
>
	Name is required.
</strong>

<form [formGroup]="form" #formDir="ngForm" (ngSubmit)="save()">
	<input formControlName="name" />
	<button type="submit">Save</button>
</form>
```

You can also provide a default parent with `provideNgxControlError({ parent: () => ... })`.

## Integrations

### ngx-translate

Loop over the possible errors and pass the error details to the [translate](https://github.com/ngx-translate/core) pipe:

```html
@for (error of ['required', 'email', 'myCustomError']; track error) {
<strong *ngxControlError="mail; track: error">
	{{ 'PATH.TO.MAIL_CONTROL.ERRORS.' + error | translate: mail.errors }}
</strong>
}
```

### Angular Material

```html
<mat-form-field>
	<mat-label>Name</mat-label>
	<input matInput [formControl]="name" />
	<mat-error *ngxControlError="name; track: 'required'">
		Name is required.
	</mat-error>
</mat-form-field>
```

## API

### Inputs

| Input                                                    | Type                           | Default                     | Description                                          |
| -------------------------------------------------------- | ------------------------------ | --------------------------- | ---------------------------------------------------- |
| `ngxControlError` (required)                             | `AbstractControl \| string`    |                             | The control, or its name inside a parent form group. |
| `ngxControlErrorTrack` (`track`, required)               | `string \| string[]`           |                             | The error key(s) that make the template render.      |
| `ngxControlErrorErrorStateMatcher` (`errorStateMatcher`) | `StateMatcher`                 | provided or default matcher | When the control counts as being in an error state.  |
| `ngxControlErrorParent` (`parent`)                       | `FormGroupDirective \| NgForm` | injected form directive     | The form whose submit state the matcher uses.        |

### Template context

| Variable    | Type                 | Description                     |
| ----------- | -------------------- | ------------------------------- |
| `$implicit` | `ValidationErrors`   | The control's current `errors`. |
| `control`   | `AbstractControl`    | The tracked control.            |
| `track`     | `string \| string[]` | The tracked error key(s).       |

### Providers

```ts
function provideNgxControlError(options?: {
	errorStateMatcher?: () => StateMatcher;
	parent?: () => NgForm | FormGroupDirective;
}): Provider[];
```
