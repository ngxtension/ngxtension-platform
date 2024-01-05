import {
	computed,
	signal,
	type Signal,
	type WritableSignal,
} from '@angular/core';

/**
 * Creates a writable signal with a `value` property.
 *
 * @example
 * const state = createSignal({ count: 0 });
 *
 * effect(() => {
 *  // Works as expected
 *  console.log(state.value.count);
 * })
 *
 * // Effect will log: 1
 *
 * state.value = { count: 1 }; // Sets the value
 * // Effect will log: 1
 *
 * double = createComputed(() => state.value.count * 2);
 *
 * console.log(double.value); // Logs 2
 *
 * @param args - Arguments to pass to `signal()`.
 * @returns A writable signal with a `value` property.
 */
export function createSignal<T>(
	...args: Parameters<typeof signal<T>>
): WritableSignal<T> & { value: T } {
	const sig = signal<T>(...args);

	Object.defineProperties(sig, {
		value: {
			get() {
				return sig();
			},
			set(value: T) {
				sig.set(value);
			},
		},
	});

	return sig as WritableSignal<T> & { value: T };
}

export function createComputed<T>(
	...args: Parameters<typeof computed<T>>
): Signal<T> & { value: T } {
	const sig = computed<T>(...args);

	Object.defineProperties(sig, {
		value: {
			get() {
				return sig();
			},
		},
	});

	return sig as Signal<T> & { value: T };
}
