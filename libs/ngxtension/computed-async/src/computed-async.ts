import {
	DestroyRef,
	Injector,
	computed,
	effect,
	inject,
	signal,
	untracked,
	type CreateComputedOptions,
} from '@angular/core';
import { assertInjector } from 'ngxtension/assert-injector';
import { Observable, Subject, isObservable, switchMap } from 'rxjs';

export function computedAsync<T>(
	computation: () => Promise<T> | Observable<T> | null | undefined,
	options?:
		| (CreateComputedOptions<void> & { initialValue?: T; injector?: Injector })
		| undefined,
) {
	return assertInjector(computedAsync, options?.injector, () => {
		const destroyRef = inject(DestroyRef);

		const source$ = new Subject<Promise<T> | Observable<T>>();

		const effectRef = effect(
			() => {
				const newSource = computation();
				if (!isObservable(newSource) && !isPromise(newSource)) return;
				untracked(() => source$.next(newSource));
			},
			{ injector: options?.injector },
		);

		const sourceValue = signal<T | null>(options?.initialValue ?? null);

		const sourceResult = source$
			.pipe(switchMap((source$) => source$))
			.subscribe({
				next: (value) => {
					sourceValue.set(value);
				},
				error: (error) => {
					sourceValue.set(null);
					throw error;
				},
			});

		destroyRef.onDestroy(() => {
			effectRef.destroy();
			sourceResult.unsubscribe();
		});

		return computed(() => sourceValue(), { equal: options?.equal });
	});
}

function isPromise<T>(value: any): value is Promise<T> {
	return value && typeof value.then === 'function';
}
