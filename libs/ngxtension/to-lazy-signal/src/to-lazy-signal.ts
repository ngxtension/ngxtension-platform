import { computed, untracked, type Signal } from '@angular/core';
import { toSignal, type ToSignalOptions } from '@angular/core/rxjs-interop';
import { assertInjector } from 'ngxtension/assert-injector';
import type { Observable, Subscribable } from 'rxjs';

type ReturnType<T, U> = (T | U) | (T | undefined) | (T | null) | T;

export function toLazySignal<T>(
	source: Observable<T> | Subscribable<T>,
): Signal<T | undefined>;

export function toLazySignal<T>(
	source: Observable<T> | Subscribable<T>,
	options: ToSignalOptions & { initialValue?: undefined; requireSync?: false },
): Signal<T | undefined>;

export function toLazySignal<T>(
	source: Observable<T> | Subscribable<T>,
	options: ToSignalOptions & { initialValue?: null; requireSync?: false },
): Signal<T | null>;

export function toLazySignal<T>(
	source: Observable<T> | Subscribable<T>,
	options: ToSignalOptions & { initialValue?: undefined; requireSync: true },
): Signal<T>;

export function toLazySignal<T, const U extends T>(
	source: Observable<T> | Subscribable<T>,
	options: ToSignalOptions & { initialValue: U; requireSync?: false },
): Signal<T | U>;

/**
 * Function `toLazySignal()` is a proxy function that will call the original
 * `toSignal()` function when the returned signal is read for the first time.
 */
export function toLazySignal<T, U = undefined>(
	source: Observable<T> | Subscribable<T>,
	options?: ToSignalOptions & { initialValue?: U },
): Signal<ReturnType<T, U>> {
	const injector = assertInjector(toLazySignal, options?.injector);
	let s: Signal<ReturnType<T, U>>;

	return computed<ReturnType<T, U>>(() => {
		if (!s) {
			s = untracked(() => toSignal(source, { ...options, injector } as any));
		}
		return s();
	});
}
