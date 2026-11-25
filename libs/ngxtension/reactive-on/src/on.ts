import { untracked } from '@angular/core';

/**
 * Makes dependencies of a computation explicit.
 *
 * Works with `effect`, `computed`, and `afterRenderEffect`.
 *
 * @example
 * // With effect
 * effect(on(a, (v) => console.log(v, b())));
 *
 * // is equivalent to:
 * effect(() => {
 *   const v = a();
 *   untracked(() => console.log(v, b()));
 * });
 *
 * @example
 * // With afterRenderEffect and phases
 * afterRenderEffect({
 *   read: on(a, (v) => {
 *     console.log('read phase', v);
 *     return v;
 *   }),
 *   write: on(b, (v, phaseValue) => {
 *     console.log('write phase', v, phaseValue);
 *   })
 * });
 */
export interface OnOptions {
	defer?: boolean;
}

export function on<T, Ret, Args extends any[]>(
	track: () => T,
	execute: (tracked: T, ...args: Args) => Ret,
	options?: OnOptions,
): (...args: Args) => Ret | undefined {
	let isFirstRun = true;
	return (...args: Args) => {
		const trackedValue = track();
		if (options?.defer && isFirstRun) {
			isFirstRun = false;
			return undefined as Ret;
		}
		isFirstRun = false;
		return untracked(() => execute(trackedValue, ...args));
	};
}
