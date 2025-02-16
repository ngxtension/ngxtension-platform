---
title: notPattern
description: A validator function that ensures form control values do NOT match a specified pattern
entryPoint: ngxtension/not-pattern
badge: stable
---

## Import

```typescript
import { notPattern } from 'ngxtension/not-pattern';
```

## Usage

Use `notPattern` to validate that a form control's value does NOT match a specific pattern. This is the opposite of Angular's built-in pattern validator.

```typescript
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { notPattern } from 'ngxtension/not-pattern';
n;

@Component({
	selector: 'my-app',
	imports: [CommonModule, ReactiveFormsModule],
	template: `
		<input [formControl]="noNumbersControl" />
		@if (noNumbersControl.errors?.['notPattern']) {
			<div>Numbers are not allowed!</div>
		}
	`,
})
export class App {
	// Will be invalid if the input contains any numbers
	noNumbersControl = new FormControl('', notPattern(/[0-9]/));
}
```

### Examples

```typescript
// Prevent numbers in text
const noNumbersControl = new FormControl('abc', notPattern(/[0-9]/));
console.log(noNumbersControl.errors); // null - valid because 'abc' has no numbers

const withNumbersControl = new FormControl('abc123', notPattern(/[0-9]/));
console.log(withNumbersControl.errors);
// {notPattern: {disallowedPattern: '/[0-9]/', actualValue: 'abc123'}}

// Can also use string patterns
const noSpecialCharsControl = new FormControl(
	'hello',
	notPattern('[!@#$%^&*(),.?":{}|<>]'),
);
```

## API

### Inputs

- `pattern: string | RegExp` - The pattern that the input should NOT match. Can be either a regular expression or a string.

### Error Format

When validation fails, the validator returns an error object with this structure:

```typescript
{
  notPattern: {
    disallowedPattern: string, // The string representation of the pattern
    actualValue: string        // The current value that matched the pattern
  }
}
```

### Notes

- Empty values are considered valid to allow for optional controls
- When using string patterns, the validator automatically adds `^` and `$` if they're not present
- The validator supports values that are strings, arrays, or Sets
