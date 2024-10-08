import {
	CreateEffectOptions,
	EffectCleanupRegisterFn,
	EffectRef,
	effect,
	untracked,
} from '@angular/core';

/**
 * We want to have the Tuple in order to use the types in the function signature
 */
type ExplicitEffectValues<T> = {
	[K in keyof T]: () => T[K];
};

/**
 * Extend the regular set of effect options
 */
declare interface CreateExplicitEffectOptions extends CreateEffectOptions {
	/**
	 * Option that allows the computation not to execute immediately, but only run on first change.
	 */
	defer?: boolean;
}

/**
 * This explicit effect function will take the dependencies and the function to run when the dependencies change.
 *
 * @example
 * ```typescript
 * import { explicitEffect } from 'ngxtension/explicit-effect';
 *
 * const count = signal(0);
 * const state = signal('idle');
 *
 * explicitEffect([count, state], ([count, state], cleanup) => {
 *   console.log('count updated', count, state);
 *
 *   cleanup(() => {
 *     console.log('cleanup');
 *   });
 * });
 * ```
 *
 * @param deps - The dependencies that the effect will run on
 * @param fn - The function to run when the dependencies change
 * @param options - The options for the effect with the addition of defer (it allows the computation to run on first change, not immediately)
 */
export function explicitEffect<
	Input extends readonly unknown[],
	Params = Input,
>(
	deps: readonly [...ExplicitEffectValues<Input>],
	fn: (deps: Params, onCleanup: EffectCleanupRegisterFn) => void,
	options?: CreateExplicitEffectOptions | undefined,
): EffectRef {
	let defer = options && options.defer;
	return effect((onCleanup) => {
		const depValues = deps.map((s) => s());
		untracked(() => {
			if (!defer) {
				fn(depValues as any, onCleanup);
			}
			defer = false;
		});
	}, options);
}
