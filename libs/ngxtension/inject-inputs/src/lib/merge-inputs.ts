/**
 * `mergeInputs` is meant to be used as a `transform` function for Object-input (input with object value)
 */
export function mergeInputs<TInputs extends object>(
	defaultValue: TInputs = {} as TInputs,
): (value: '' | Partial<TInputs>) => TInputs {
	return (value: '' | Partial<TInputs>) => {
		// NOTE: if the directive is used as `<div directive></div>` without binding syntax
		// then the bound value is `''` in which case we'll return the `defaultValue` for the input
		if (value === '') return defaultValue;
		return { ...defaultValue, ...value };
	};
}
