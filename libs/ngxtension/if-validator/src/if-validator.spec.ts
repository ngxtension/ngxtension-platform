import { FormControl } from '@angular/forms';
import { of } from 'rxjs';
import { ifAsyncValidator, ifValidator } from './if-validator';

describe('ifValidator', () => {
	it('should return null if the condition is false', () => {
		const control = new FormControl();
		const condition = () => false;
		const validatorFn = () => null;

		const validator = ifValidator(condition, validatorFn);
		const result = validator(control);

		expect(result).toBeNull();
	});

	it('should return the result of a provided validatorFn if the condition is true', () => {
		const control = new FormControl('a');
		const condition = (ctrl: FormControl) => ctrl.value !== 'a';
		const validatorFn = () => ({ invalid: true });

		const validator = ifValidator(condition, validatorFn);

		const result = validator(control);
		expect(result).toBeNull();

		control.setValue('b');
		const newResult = validator(control);
		expect(newResult).toEqual({ invalid: true });
	});

	it('should return null if an array with no items is provided', () => {
		const control = new FormControl();
		const condition = () => true;

		const validator = ifValidator(condition, []);
		const result = validator(control);

		expect(result).toBeNull();
	});

	it('should return the result of a provided validatorFn', () => {
		const control = new FormControl();
		const condition = () => true;
		const validatorFn = () => ({ invalid: true });

		const validator = ifValidator(condition, validatorFn);
		const result = validator(control);

		expect(result).toEqual({ invalid: true });
	});

	it('should be able to query the presence of a provided validatorFn', () => {
		const condition = () => true;
		const validatorFn = () => ({ invalid: true });

		const validator = ifValidator(condition, validatorFn);
		const control = new FormControl(null, validator);
		const hasValidator = control.hasValidator(validator);

		expect(hasValidator).toBe(true);
	});

	it('should return the result of a sole validatorFn provided in an array', () => {
		const control = new FormControl();
		const condition = () => true;
		const validatorFn = () => ({ invalid: true });

		const validator = ifValidator(condition, [validatorFn]);
		const result = validator(control);

		expect(result).toEqual({ invalid: true });
	});

	it('should be able to query the presence of a sole validatorFn provided in an array', () => {
		const condition = () => true;
		const validatorFn = () => ({ invalid: true });

		const validator = ifValidator(condition, [validatorFn]);
		const control = new FormControl(null, validator);
		const hasValidator = control.hasValidator(validator);

		expect(hasValidator).toBe(true);
	});

	it('should return the result of multiple provided validators', () => {
		const control = new FormControl();
		const condition = () => true;
		const validatorFn1 = () => ({ bad: true });
		const validatorFn2 = () => ({ worse: true });

		const validator = ifValidator(condition, [validatorFn1, validatorFn2]);
		const result = validator(control);

		expect(result).toEqual({ bad: true, worse: true });
	});
});

describe('ifAsyncValidator', () => {
	it('should return null if the condition is false', () => {
		const control = new FormControl();
		const condition = () => false;
		const validatorFn = () => of(null);

		const validator = ifAsyncValidator(condition, validatorFn);
		control.setAsyncValidators(validator);

		expect(control.errors).toBe(null);
	});

	it('should return the result of a provided async validatorFn if the condition is true', () => {
		const control = new FormControl('a');
		const condition = (ctrl: FormControl) => ctrl.value !== 'a';
		const validatorFn = () => of({ invalid: true });

		const validator = ifAsyncValidator(condition, validatorFn);
		control.setAsyncValidators(validator);

		control.setValue('b');

		expect(control.errors).toEqual({ invalid: true });
	});

	it('should be able to query the presence of a provided async validatorFn', () => {
		const condition = () => true;
		const validatorFn = () => of({ invalid: true });

		const validator = ifAsyncValidator(condition, validatorFn);
		const control = new FormControl(null, { asyncValidators: validator });
		const hasValidator = control.hasAsyncValidator(validator);

		expect(hasValidator).toBe(true);
	});
});
