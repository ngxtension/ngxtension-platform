import {
	AbstractControl,
	FormControl,
	Validators,
	type AsyncValidatorFn,
	type ValidatorFn,
} from '@angular/forms';
import { of } from 'rxjs';

/**
 * Simple Validation with If condition
 */
export function ifValidator(
	condition: (control: FormControl) => boolean,
	validatorFn: ValidatorFn | ValidatorFn[]
): ValidatorFn {
	return (control: AbstractControl) => {
		if (!validatorFn || !condition(<FormControl>control)) {
			return null;
		}
		const validatorFns = Array.isArray(validatorFn)
			? (validatorFn as ValidatorFn[])
			: [validatorFn];
		return Validators.compose(validatorFns)?.(control) ?? null;
	};
}

/**
 * With Async Validation
 */
export function ifAsyncValidator(
	condition: (control: FormControl) => boolean,
	validatorFn: AsyncValidatorFn
): AsyncValidatorFn {
	return (control: AbstractControl) => {
		if (!validatorFn || !condition(<FormControl>control)) {
			return of(null);
		}

		return validatorFn(control);
	};
}
