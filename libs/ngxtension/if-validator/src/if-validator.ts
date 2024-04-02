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
	validatorFn: ValidatorFn | ValidatorFn[],
): ValidatorFn {
	return (control: AbstractControl) => {
		if (!condition(<FormControl>control)) {
			return null;
		}

		if (!Array.isArray(validatorFn)) {
			return validatorFn(control);
		}

		if (validatorFn.length === 0) {
			return null;
		}

		if (validatorFn.length === 1) {
			return validatorFn[0](control);
		}

		const composed = Validators.compose(validatorFn);
		return composed ? composed(control) : null;
	};
}

/**
 * With Async Validation
 */
export function ifAsyncValidator(
	condition: (control: FormControl) => boolean,
	validatorFn: AsyncValidatorFn,
): AsyncValidatorFn {
	return (control: AbstractControl) => {
		if (!condition(<FormControl>control)) {
			return of(null);
		}

		return validatorFn(control);
	};
}
