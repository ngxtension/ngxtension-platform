import {
	AbstractControl,
	AsyncValidatorFn,
	FormControl,
	ValidatorFn,
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

		if (validatorFn instanceof Array) {
			for (let i = 0; i < validatorFn.length; i++) {
				const result = validatorFn[i](control);
				if (result) return result;
			}

			return null;
		}

		return validatorFn(control);
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
