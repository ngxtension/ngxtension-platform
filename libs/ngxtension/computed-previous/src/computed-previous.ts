import { computed, untracked, type Signal } from '@angular/core';

/**
 * Returns a signal that emits the previous value of the given signal.
 * The first time the signal is emitted, the previous value will be the same as the current value.
 *
 * @example
 * ```ts
 * const value = signal(0);
 * const previous = computedPrevious(value);
 *
 * effect(() => {
 *  console.log('Current value:', value());
 *  console.log('Previous value:', previous());
 * });
 *
 * Logs:
 * // Current value: 0
 * // Previous value: 0
 *
 * value.set(1);
 *
 * Logs:
 * // Current value: 1
 * // Previous value: 0
 *
 * value.set(2);
 *
 * Logs:
 * // Current value: 2
 * // Previous value: 1
 *```
 *
 * @param s Signal to compute previous value for
 * @returns Signal that emits previous value of `s`
 */
export function computedPrevious<T>(s: Signal<T>): Signal<T> {
	let current = null as T;
	let previous = untracked(() => s()); // initial value is the current value

	return computed(() => {
		current = s();
		const result = previous;
		previous = current;
		return result;
	});
}
