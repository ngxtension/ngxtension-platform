import {
	assertInInjectionContext,
	isDevMode,
	type Signal,
	type WritableSignal,
} from '@angular/core';
import {
	toObservable,
	type ToObservableOptions,
} from '@angular/core/rxjs-interop';
import type { Observable } from 'rxjs';

export type ObservableSignal<T> = Signal<T> & Observable<T>;

export function toObservableSignal<T>(
	s: WritableSignal<T>,
	options?: ToObservableOptions,
): WritableSignal<T> & Observable<T>;
export function toObservableSignal<T>(
	s: Signal<T>,
	options?: ToObservableOptions,
): ObservableSignal<T>;

export function toObservableSignal<T>(
	s: Signal<T>,
	options?: ToObservableOptions,
) {
	if (isDevMode() && !options?.injector) {
		assertInInjectionContext(toObservableSignal);
	}

	const obs = toObservable(s, options);

	return new Proxy(s, {
		get(_, prop) {
			if (prop in s) {
				return (s as any)[prop];
			}
			return (obs as any)[prop];
		},
	});
}
