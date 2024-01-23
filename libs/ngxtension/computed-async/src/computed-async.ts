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
  concatAll,
  exhaustAll,
  isObservable,
  mergeAll,
  switchAll,
} from 'rxjs';

type ComputedAsyncBehavior = 'switch' | 'merge' | 'concat' | 'exhaust';

type ComputationResult<T> = Promise<T> | Observable<T> | T | undefined;

interface ComputedAsyncOptions<T> extends CreateComputedOptions<T> {
	initialValue?: T;
	injector?: Injector;
	behavior?: ComputedAsyncBehavior;
}

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
 * The computed value will be `undefined` until the promise resolves.
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
	computation: (previousValue?: T | undefined) => ComputationResult<T>,
): Signal<T|undefined>
export function computedAsync<T>(
	computation: (previousValue?: T | undefined) => ComputationResult<T>,
  options: {initialValue:undefined} & ComputedAsyncOptions<T>,
): Signal<T|undefined>
export function computedAsync<T>(
	computation: (previousValue?: T | undefined) => ComputationResult<T>,
	options: ComputedAsyncOptions<T>,
): Signal<T>
export function computedAsync<T>(
	computation: (previousValue?: T | undefined) => ComputationResult<T>,
	options?: ComputedAsyncOptions<T>,
): Signal<T|undefined> {
	return assertInjector(computedAsync, options?.injector, () => {
		const destroyRef = inject(DestroyRef);

		// source$ is a Subject that will emit the new source value
		const sourceEvent$ = new Subject<Promise<T> | Observable<T>>();

		// will hold the current value
		const sourceValue = signal<T | undefined>(
			options?.initialValue ?? undefined,
		);

		const effectRef = effect(
			() => {
				// we need to have an untracked() here because we don't want to register the sourceValue as a dependency
				// otherwise, we would have an infinite loop
				const currentValue = untracked(() => sourceValue());

				const newSource = computation(currentValue);

				if (!isObservable(newSource) && !isPromise(newSource)) {
					// if the new source is not an observable or a promise, we set the value immediately
					untracked(() => sourceValue.set(newSource));
				} else {
					// we untrack the source$.next() so that we don't register other signals as dependencies
					untracked(() => sourceEvent$.next(newSource));
				}
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
			},
		});

		destroyRef.onDestroy(() => {
			effectRef.destroy();
			sourceResult.unsubscribe();
		});

		// we return a computed value that will return the current value
		// in order to support the same API as computed()
		return computed(
			() => {
				const value: T = sourceValue()!;
				return value;
			},
			{ equal: options?.equal },
		);
	});
}

function createFlattenObservable<T>(
	source: Subject<Promise<T> | Observable<T>>,
	behavior: ComputedAsyncBehavior,
): Observable<T> {
	const KEY_OPERATOR_MAP = {
		merge: mergeAll,
		concat: concatAll,
		exhaust: exhaustAll,
		switch: switchAll,
	};

	return source.pipe(KEY_OPERATOR_MAP[behavior]());
}

function isPromise<T>(value: any): value is Promise<T> {
	return value && typeof value.then === 'function';
}
