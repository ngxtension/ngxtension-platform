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
	return Object.defineProperty(sig, 'value', {
		get: sig.asReadonly(),
		set: sig.set.bind(sig),
	}) as WritableSignal<T> & { value: T };
}

/**
 * Creates a computed signal with a `value` property.
 * @param args - Arguments to pass to `computed()`.
 * @returns A computed signal with a `value` property.
 * @see createSignal
 */
export function createComputed<T>(
	...args: Parameters<typeof computed<T>>
): Signal<T> & { value: T } {
	const sig = computed<T>(...args);
	return Object.defineProperty(sig, 'value', { get: sig }) as Signal<T> & {
		value: T;
	};
}
