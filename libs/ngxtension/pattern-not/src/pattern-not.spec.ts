import { FormControl } from '@angular/forms';
import { patternNot } from './pattern-not';

describe('patternNot', () => {
	it('should return null if no pattern is provided', () => {
		const control = new FormControl('test');
		const validator = patternNot('');
		const result = validator(control);

		expect(result).toBeNull();
	});

	it('should return null for empty input values', () => {
		const control = new FormControl('');
		const validator = patternNot(/[0-9]/);
		const result = validator(control);

		expect(result).toBeNull();
	});

	it('should return null when value does not match the pattern', () => {
		const control = new FormControl('abc');
		const validator = patternNot(/[0-9]/);
		const result = validator(control);

		expect(result).toBeNull();
	});

	it('should return error when value matches the pattern', () => {
		const control = new FormControl('abc123');
		const validator = patternNot(/[0-9]/);
		const result = validator(control);

		expect(result).toEqual({
			patternNot: {
				disallowedPattern: '/[0-9]/',
				actualValue: 'abc123',
			},
		});
	});

	it('should work with string patterns', () => {
		const control = new FormControl('abc123');
		const validator = patternNot('abc123');
		const result = validator(control);

		expect(result).toEqual({
			patternNot: {
				disallowedPattern: '^abc123$',
				actualValue: 'abc123',
			},
		});
	});

	it('should be able to query the presence of the validator', () => {
		const validator = patternNot(/[0-9]/);
		const control = new FormControl('test', validator);
		const hasValidator = control.hasValidator(validator);

		expect(hasValidator).toBe(true);
	});

	it('should handle null values', () => {
		const control = new FormControl(null);
		const validator = patternNot(/[0-9]/);
		const result = validator(control);

		expect(result).toBeNull();
	});

	it('should handle array values', () => {
		const control = new FormControl([]);
		const validator = patternNot(/[0-9]/);
		const result = validator(control);

		expect(result).toBeNull();
	});

	it('should handle Set values', () => {
		const control = new FormControl(new Set());
		const validator = patternNot(/[0-9]/);
		const result = validator(control);

		expect(result).toBeNull();
	});
});
