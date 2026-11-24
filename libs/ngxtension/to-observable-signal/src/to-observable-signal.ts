import {
	assertInInjectionContext,
	isDevMode,
	isSignal,
	type Signal,
	type WritableSignal,
} from '@angular/core';
import {
	toObservable,
	toSignal,
	type ToObservableOptions,
} from '@angular/core/rxjs-interop';
import type { Observable, Subscribable } from 'rxjs';

export type ObservableSignal<T> = Signal<T> & Observable<T>;

export function toObservableSignal<T>(
	s: WritableSignal<T>,
	options?: ToObservableOptions,
): WritableSignal<T> & Observable<T>;
export function toObservableSignal<T>(
	s: Signal<T>,
	options?: ToObservableOptions,
): ObservableSignal<T>;
/**
 * With an Observable source the signal reads `undefined` until the first emission
 * (it is created with `toSignal`), and it is not writable.
 */
export function toObservableSignal<T>(
	s: Observable<T> | Subscribable<T>,
	options?: ToObservableOptions,
): Signal<T | undefined> & Observable<T>;

export function toObservableSignal<T>(
	source: Signal<T> | Subscribable<T>,
	options?: ToObservableOptions,
) {
	if (isDevMode() && !options?.injector) {
		assertInInjectionContext(toObservableSignal);
	}

	let s: Signal<T | undefined>;
	let obs: Subscribable<T>;

	if (isSignal(source)) {
		s = source;
		obs = toObservable(source as Signal<T>, options);
	} else {
		obs = source;
		s = toSignal(obs, { injector: options?.injector });
	}

	return new Proxy(s, {
		get(_, prop) {
			if (prop in s) {
				return (s as any)[prop];
			}
			return (obs as any)[prop];
		},
	});
}
