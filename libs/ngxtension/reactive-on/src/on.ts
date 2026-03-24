import { EffectCleanupRegisterFn, Signal, untracked } from '@angular/core';

export type Accessor<T> = Signal<T> | (() => T);

/**
 * Makes dependencies of a computation explicit

 * @param deps list of reactive dependencies or a single reactive dependency
 * @param fn computation on input; the current previous content(s) of input and the previous value are given as arguments and it returns a new value
 * @returns an effect function that is passed into `effect`. For example:
 *
 * ```typescript
 * effect(on(a, (v) => console.log(v, b())));
 *
 * // is equivalent to:
 * effect(() => {
 *   const v = a();
 *   untracked(() => console.log(v, b()));
 * });
 * ```
 */
export function on<
	const Deps extends readonly Accessor<unknown>[],
	U,
	V = U | undefined,
>(
	deps: readonly [...Deps],
	fn: (
		input: {
			-readonly [K in keyof Deps]: Deps[K] extends Accessor<infer T>
				? T
				: never;
		},
		prevInput:
			| {
					-readonly [K in keyof Deps]: Deps[K] extends Accessor<infer T>
						? T
						: never;
			  }
			| undefined,
		prevValue: V | undefined,
		cleanupFn: EffectCleanupRegisterFn,
	) => U,
	options?: { defer?: boolean },
): (onCleanup: EffectCleanupRegisterFn) => void;

export function on<
	const Deps extends Record<string, Accessor<unknown>>,
	U,
	V = U | undefined,
>(
	deps: Deps,
	fn: (
		input: { [K in keyof Deps]: Deps[K] extends Accessor<infer T> ? T : never },
		prevInput:
			| { [K in keyof Deps]: Deps[K] extends Accessor<infer T> ? T : never }
			| undefined,
		prevValue: V | undefined,
		cleanupFn: EffectCleanupRegisterFn,
	) => U,
	options?: { defer?: boolean },
): (onCleanup: EffectCleanupRegisterFn) => void;

export function on<S, U, V = U | undefined>(
	deps: Accessor<S>,
	fn: (
		input: S,
		prevInput: S | undefined,
		prevValue: V | undefined,
		cleanupFn: EffectCleanupRegisterFn,
	) => U,
	options?: { defer?: boolean },
): (onCleanup: EffectCleanupRegisterFn) => void;

export function on(
	deps:
		| Accessor<unknown>
		| readonly Accessor<unknown>[]
		| Record<string, Accessor<unknown>>,
	fn: (
		input: any,
		prevInput: any,
		prevValue: any,
		cleanupFn: EffectCleanupRegisterFn,
	) => any,
	options?: { defer?: boolean },
): (onCleanup: EffectCleanupRegisterFn) => void {
	const isArray = Array.isArray(deps);
	const isAccessor = typeof deps === 'function';
	let prevInput: unknown;
	let prevValue: unknown;
	let defer = options && options.defer;

	return (onCleanup: EffectCleanupRegisterFn) => {
		let input: unknown;

		if (isArray) {
			input = (deps as readonly Accessor<unknown>[]).map((d) => d());
		} else if (isAccessor) {
			input = (deps as Accessor<unknown>)();
		} else {
			// Object
			input = Object.keys(deps).reduce(
				(acc, key) => {
					acc[key] = (deps as Record<string, Accessor<unknown>>)[key]();
					return acc;
				},
				{} as Record<string, unknown>,
			);
		}

		if (defer) {
			defer = false;
			return;
		}

		untracked(() => {
			prevValue = fn(input, prevInput, prevValue, onCleanup);
			prevInput = input;
		});
	};
}
