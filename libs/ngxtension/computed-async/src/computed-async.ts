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

/**
 * A computed value that can be async! This is useful for when you need to compute a value based on a Promise or Observable.
 *
 * @example
 * ```ts
 * const value = computedAsync(() =>
 *   fetch(`https://localhost/api/people/${this.userId()}`).then(r => r.json())
 * );
 * ```
 *
 * The computed value will be `null` until the promise resolves.
 * Everytime the userId changes, the fetch will be called again, and the previous fetch will be cancelled.
 * If the promise rejects, the error will be thrown.
 *
 * It can also be used with Observables:
 *
 * ```ts
 * const value = computedAsync(() =>
 *  this.http.get(`https://localhost/api/people/${this.userId()}`)
 * );
 * ```
 *
 * @param computation
 * @param options
 */
export function computedAsync<T>(
	computation: () => Promise<T> | Observable<T> | T | null,
	options?:
		| (CreateComputedOptions<void> & { initialValue?: T; injector?: Injector })
		| undefined,
) {
	return assertInjector(computedAsync, options?.injector, () => {
		const destroyRef = inject(DestroyRef);

		// source$ is a Subject that will emit the new source value
		const source$ = new Subject<Promise<T> | Observable<T>>();

		// will hold the current value
		const sourceValue = signal<T | null>(options?.initialValue ?? null);

		const effectRef = effect(
			() => {
				const newSource = computation();
				if (!isObservable(newSource) && !isPromise(newSource)) {
					// if the new source is not an observable or a promise, we set the value immediately
					sourceValue.set(newSource);
					return;
				}

				// we untrack the source$.next() so that we don't register other signals as dependencies
				untracked(() => source$.next(newSource));
			},
			{ injector: options?.injector, allowSignalWrites: true },
		);

		const sourceResult = source$
			// we switchMap to the new source so that we cancel the previous source
			.pipe(switchMap((s) => s))
			.subscribe({
				next: (value) => {
					sourceValue.set(value);
				},
				error: (error) => {
					// TODO: should we set the value to null here?
					sourceValue.set(null);
					throw error;
				},
			});

		destroyRef.onDestroy(() => {
			effectRef.destroy();
			sourceResult.unsubscribe();
		});

		// we return a computed value that will return the current value
		// in order to support the same API as computed()
		return computed(() => sourceValue(), { equal: options?.equal });
	});
}

function isPromise<T>(value: any): value is Promise<T> {
	return value && typeof value.then === 'function';
}
