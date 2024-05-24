import {
	computed,
	isSignal,
	reflectComponentType,
	type InputSignal,
	type Signal,
	type Type,
} from '@angular/core';

export type InjectedInputs<T> = {
	[P in keyof T as T[P] extends InputSignal<any>
		? P
		: never]: T[P] extends InputSignal<infer U> ? U : never;
};

export function injectInputs<TDir extends Type<any>>(
	dir: InstanceType<TDir>,
	dirType: TDir,
): Signal<InjectedInputs<InstanceType<TDir>>> {
	const mirror = reflectComponentType(dirType);

	if (!mirror) {
		throw new Error(
			`[ngxtension] The provided symbol is not a component nor a directive`,
		);
	}

	const inputs = mirror.inputs.reduce(
		(inputs, cur) => {
			if (dir[cur.propName] && isSignal(dir[cur.propName])) {
				inputs[cur.propName] = dir[cur.propName];
			}
			return inputs;
		},
		{} as Record<string, InputSignal<any>>,
	);

	return computed(() =>
		Object.keys(inputs).reduce(
			(acc, key) => {
				acc[key] = inputs[key]();
				return acc;
			},
			{} as Record<string, any>,
		),
	) as Signal<InjectedInputs<InstanceType<TDir>>>;
}
