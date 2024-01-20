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
	for (const obsKey in obs) {
		(s as any)[obsKey] = (obs as any)[obsKey];
	}
	return s;
}
