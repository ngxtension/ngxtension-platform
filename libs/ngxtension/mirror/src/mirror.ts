import { computed, signal, Signal, untracked } from '@angular/core';

export interface MirrorSignal<T> {
	(): T;
	set(value: T): void;
	update(fn: (value: T) => T): void;
}

/**
 * Creates a mirror signal that mirrors the value of the given signal.
 * The mirrored signal is a computed signal that is updated when the given signal is updated.
 */
export function mirror<T>(outer: Signal<T>): MirrorSignal<T> {
	const inner = computed(() => signal(outer()));
	const mirrored: MirrorSignal<T> = () => inner()();
	mirrored.set = (value: T) => untracked(inner).set(value);
	mirrored.update = (fn: (value: T) => T) => untracked(inner).update(fn);
	return mirrored;
}
