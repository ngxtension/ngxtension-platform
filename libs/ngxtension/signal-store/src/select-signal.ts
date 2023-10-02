import {
	computed,
	type CreateComputedOptions,
	type Signal,
} from '@angular/core';

export function selectSignal<Result>(
	projector: () => Result,
	config?: CreateComputedOptions<Result>
): Signal<Result>;
export function selectSignal<Signals extends Signal<any>[], Result>(
	...args: [
		...signals: Signals,
		projector: (
			...values: {
				[K in keyof Signals]: Signals[K] extends Signal<infer Value>
					? Value
					: never;
			}
		) => Result
	]
): Signal<Result>;
export function selectSignal<Signals extends Signal<any>[], Result>(
	...args: [
		...signals: Signals,
		projector: (
			...values: {
				[K in keyof Signals]: Signals[K] extends Signal<infer Value>
					? Value
					: never;
			}
		) => Result,
		config: CreateComputedOptions<Result>
	]
): Signal<Result>;
export function selectSignal<Result>(...args: unknown[]): Signal<Result> {
	const selectSignalArgs = [...args];

	const config: CreateComputedOptions<Result> =
		typeof selectSignalArgs[selectSignalArgs.length - 1] === 'object'
			? (selectSignalArgs.pop() as CreateComputedOptions<Result>)
			: { equal: defaultEqualityFn };
	const projector = selectSignalArgs.pop() as (...values: unknown[]) => Result;
	const signals = selectSignalArgs as Signal<unknown>[];

	const computation =
		signals.length === 0
			? projector
			: () => {
					const values = signals.map((signal) => signal());
					return projector(...values);
			  };

	return computed(computation, config);
}

export function defaultEqualityFn<T>(previous: T, current: T): boolean {
	return Object.is(previous, current);
}
