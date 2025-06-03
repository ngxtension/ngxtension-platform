import {
	AbstractControl,
	ValidationErrors,
	ValidatorFn,
	Validators,
} from '@angular/forms';

/**
 * @description
 * Validator that performs pattern matching against a string input that should NOT match the pattern.
 * Opposite of Angular's built-in pattern validator.
 *
 * @usageNotes
 *
 * ```typescript
 * const control = new FormControl('abc', notPattern(/[0-9]/));
 * console.log(control.errors); // null - valid because 'abc' does not contain numbers
 *
 * const control2 = new FormControl('abc123', notPattern(/[0-9]/));
 * console.log(control2.errors); // {notPattern: {requiredPattern: '/[0-9]/', actual: 'abc123'}} - invalid because it contains numbers
 * ```
 *
 * @param pattern A regular expression or string to match against
 * @returns A validator function that returns an error map with the `notPattern` property
 * if the validation check fails, otherwise `null`.
 */
export function notPattern(pattern: string | RegExp): ValidatorFn {
	if (!pattern) return Validators.nullValidator;
	let regex: RegExp;
	let regexStr: string;
	if (typeof pattern === 'string') {
		regexStr = '';

		if (pattern.charAt(0) !== '^') regexStr += '^';

		regexStr += pattern;

		if (pattern.charAt(pattern.length - 1) !== '$') regexStr += '$';

		regex = new RegExp(regexStr);
	} else {
		regexStr = pattern.toString();
		regex = pattern;
	}
	return (control: AbstractControl): ValidationErrors | null => {
		if (isEmptyInputValue(control.value)) {
			return null; // don't validate empty values to allow optional controls
		}
		const value: string = control.value;
		console.log('value', value, 'regex', regex);
		return regex.test(value)
			? { notPattern: { disallowedPattern: regexStr, actualValue: value } }
			: null;
	};
}

function isEmptyInputValue(value: unknown): boolean {
	return value == null || lengthOrSize(value) === 0;
}

/**
 * Extract the length property in case it's an array or a string.
 * Extract the size property in case it's a set.
 * Return null else.
 * @param value Either an array, set or undefined.
 */
function lengthOrSize(value: unknown): number | null {
	// non-strict comparison is intentional, to check for both `null` and `undefined` values
	if (value == null) {
		return null;
	} else if (Array.isArray(value) || typeof value === 'string') {
		return value.length;
	} else if (value instanceof Set) {
		return value.size;
	}

	return null;
}
