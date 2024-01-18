import {
	DestroyRef,
	Injector,
	computed,
	effect,
	inject,
	signal,
	untracked,
	type CreateComputedOptions,
	type Signal,
} from '@angular/core';
import { assertInjector } from 'ngxtension/assert-injector';
import {
	Observable,
	Subject,
	concatMap,
	exhaustMap,
	isObservable,
	mergeMap,
	switchMap,
} from 'rxjs';

export type ComputedAsyncBehavior = 'switch' | 'merge' | 'concat' | 'exhaust';

interface ComputedAsyncOptions<T> extends CreateComputedOptions<void> {
	initialValue?: T;
	injector?: Injector;
	behavior?: ComputedAsyncBehavior;
}

export function computedAsync<T>(
	computation: () => Promise<T> | Observable<T> | T | null,
	options?: ComputedAsyncOptions<T> | undefined,
): T extends null ? Signal<T | null> : Signal<T>;

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
 * Everytime the userId changes, the fetch will be called again, and the previous fetch will be cancelled (it uses switchMap by default).
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
 * You can also pass an `initialValue` option to set the initial value of the computed value.
 *
 * ```ts
 * const userTasks = computedAsync(() =>
 *   this.http.get(`https://localhost/api/tasks?userId=${this.userId()}`),
 *   { initialValue: [] }
 * );
 * ```
 *
 * You can also pass a `behavior` option to change the behavior of the computed value.
 * - `switch` (default): will cancel the previous computation when a new one is triggered
 * - `merge`: will use `mergeMap` to merge the last observable with the new one
 * - `concat`: will use `concatMap` to concat the last observable with the new one
 * - `exhaust`: will use `exhaustMap` to skip all the new emissions until the last observable completes
 *
 * You can also pass an `injector` option if you want to use it outside of the injection context.
 *
 * @param computation
 * @param options
 */
export function computedAsync<T>(
	computation: () => Promise<T> | Observable<T> | T | null,
	options: ComputedAsyncOptions<T> | undefined = { behavior: 'switch' },
) {
	return assertInjector(computedAsync, options?.injector, () => {
		const destroyRef = inject(DestroyRef);

		// source$ is a Subject that will emit the new source value
		const sourceEvent$ = new Subject<Promise<T> | Observable<T>>();

		// will hold the current value
		const sourceValue = signal<T | null>(options?.initialValue ?? null);

		const effectRef = effect(
			() => {
				const newSource = computation();
				if (!isObservable(newSource) && !isPromise(newSource)) {
					// if the new source is not an observable or a promise, we set the value immediately
					untracked(() => sourceValue.set(newSource));
					return;
				}

				// we untrack the source$.next() so that we don't register other signals as dependencies
				untracked(() => sourceEvent$.next(newSource));
			},
			{ injector: options?.injector },
		);

		const source$: Observable<T> = createFlattenObservable(
			sourceEvent$,
			options?.behavior ?? 'switch',
		);

		const sourceResult = source$.subscribe({
			next: (value) => sourceValue.set(value),
			error: (error) => {
				// NOTE: Error should be handled by the user (using catchError or .catch())
				sourceValue.set(error);
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

function createFlattenObservable<T>(
	source: Subject<Promise<T> | Observable<T>>,
	behavior: ComputedAsyncBehavior,
): Observable<T> {
	switch (behavior) {
		case 'merge':
			return source.pipe(mergeMap((s) => s));
		case 'concat':
			return source.pipe(concatMap((s) => s));
		case 'exhaust':
			return source.pipe(exhaustMap((s) => s));
		default: // switch
			return source.pipe(switchMap((s) => s));
	}
}

function isPromise<T>(value: any): value is Promise<T> {
	return value && typeof value.then === 'function';
}
