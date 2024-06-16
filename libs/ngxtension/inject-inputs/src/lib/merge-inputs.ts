/**
 * `mergeInputs` is meant to be used as a `transform` function for Object-input (input with object value)
 */
export function mergeInputs<TInputs extends object>(
	defaultValue: TInputs = {} as TInputs,
) {
	return (value: Partial<TInputs>) =>
		({ ...defaultValue, ...value }) as TInputs;
}
