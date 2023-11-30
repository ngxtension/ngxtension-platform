import { computed, type Signal } from '@angular/core';

/**
 * Returns a signal that emits the previous value of the given signal.
 * The first time the signal is emitted, the previous value will be `null`.
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
 * // Previous value: null
 *
 * value.set(1);
 *
 * Logs:
 * // Current value: 1
 * // Previous value: 0
 *```

 * @param s Signal to compute previous value for
 * @returns Signal that emits previous value of `s`
 */
export function computedPrevious<T>(s: Signal<T>): Signal<T | null> {
	let current = null as T;
	let previous = null as T;

	return computed(() => {
		const value = s();
		if (value !== current) {
			previous = current;
			current = value;
		}
		return previous;
	});
}
