import {
	assertInInjectionContext,
	isDevMode,
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
	s: WritableSignal<T> | Observable<T> | Subscribable<T>,
	options?: ToObservableOptions,
): WritableSignal<T> & Observable<T>;
export function toObservableSignal<T>(
	s: Signal<T> | Observable<T> | Subscribable<T>,
	options?: ToObservableOptions,
): ObservableSignal<T>;

export function toObservableSignal<T>(
	source: Signal<T> | Observable<T> | Subscribable<T>,
	options?: ToObservableOptions,
) {
	if (isDevMode() && !options?.injector) {
		assertInInjectionContext(toObservableSignal);
	}

	let s: Signal<T | undefined>;
	let obs: Observable<T>;

	if (typeof source === 'function') {
		s = source as Signal<T>;
		obs = toObservable(source as Signal<T>, options);
	} else {
		obs = source as unknown as Observable<T>;
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
