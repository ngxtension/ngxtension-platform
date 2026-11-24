---
title: notPattern
description: A validator function that ensures form control values do NOT match a specified pattern
entryPoint: ngxtension/not-pattern
badge: stable
---

`notPattern` is a form validator that fails when the value **matches** a pattern. It is the opposite of Angular's `Validators.pattern`, and handy for "must not contain" rules such as no digits, no spaces or no forbidden words.

## Usage

```angular-ts
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { notPattern } from 'ngxtension/not-pattern';

@Component({
	selector: 'app-name-field',
	imports: [ReactiveFormsModule],
	template: `
		<input [formControl]="name" />
		@if (name.hasError('notPattern')) {
			<p>Numbers are not allowed.</p>
		}
	`,
})
export class NameField {
	// Invalid as soon as the value contains a digit
	name = new FormControl('', notPattern(/[0-9]/));
}
```

```ts
new FormControl('abc', notPattern(/[0-9]/)).errors;
// null

new FormControl('abc123', notPattern(/[0-9]/)).errors;
// { notPattern: { disallowedPattern: '/[0-9]/', actualValue: 'abc123' } }
```

## RegExp or string

The two forms behave differently, like `Validators.pattern`:

- A **RegExp** is tested as is, so `/[0-9]/` matches any value that **contains** a digit.
- A **string** is wrapped in `^` and `$` (when they're missing), so it only matches when the **whole value** matches.

```ts
// Fails only when the whole value is digits: '123' is invalid, 'abc123' is valid
notPattern('[0-9]+');

// Fails when the value contains a special character anywhere
notPattern(/[!@#$%^&*(),.?":{}|<>]/);
```

Use a RegExp for "must not contain" rules.

:::caution
Don't use the `g` or `y` flag. `RegExp.test` remembers `lastIndex` with those flags, so the same value can alternate between valid and invalid.
:::

## Empty values

Empty values (`null`, `undefined`, `''`, an empty array or an empty `Set`) are valid, so optional fields aren't flagged. Combine with `Validators.required` if the field must be filled:

```ts
username = new FormControl('', [Validators.required, notPattern(/\s/)]);
```

## API

```ts
function notPattern(pattern: string | RegExp): ValidatorFn;
```

| Parameter | Type               | Description                                                                                                 |
| --------- | ------------------ | ----------------------------------------------------------------------------------------------------------- |
| `pattern` | `string \| RegExp` | The pattern the value must not match. Strings are anchored with `^…$`. An empty pattern disables the check. |

When the value matches, the validator returns:

```ts
{
	notPattern: {
		disallowedPattern: string; // the pattern as a string, e.g. '/[0-9]/' or '^[0-9]+$'
		actualValue: string; // the control value
	}
}
```

## Related

- Angular's [`Validators.pattern`](https://angular.dev/api/forms/Validators#pattern): the value must match the pattern.
