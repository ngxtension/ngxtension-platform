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
 * @param options - The options for the effect
 */
export function explicitEffect<
	Input extends readonly unknown[],
	Params = Input,
>(
	deps: readonly [...ExplicitEffectValues<Input>],
	fn: (deps: Params, onCleanup: EffectCleanupRegisterFn) => void,
	options?: CreateEffectOptions | undefined,
): EffectRef {
	return effect((onCleanup) => {
		const depValues = deps.map((s) => s());
		untracked(() => fn(depValues as any, onCleanup));
	}, options);
}
