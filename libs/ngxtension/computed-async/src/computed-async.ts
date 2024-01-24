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
	type WritableSignal,
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

	/**
	 * Whether to require that the observable emits synchronously when `computedAsync` subscribes.
	 *
	 * If this is `true`, `computedAsync` will assert that the observable produces a value immediately upon
	 * subscription. Setting this option removes the need to either deal with `undefined` in the
	 * signal type or provide an `initialValue`, at the cost of a runtime error if this requirement is
	 * not met.
	 */
	requireSync?: boolean;
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
 * If you want to require that the observable emits synchronously when `computedAsync` subscribes, you can set the `requireSync` option to `true`.
 *
 * ```ts
 * const userTasks = computedAsync(() =>
 *   this.http.get(`https://localhost/api/tasks?userId=${this.userId()}`).pipe(
 * 	   startWith([]),
 *   ),
 *   { requireSync: true }
 * );
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

// Base case: no options -> `undefined` in the result type
export function computedAsync<T>(
	computation: (previousValue?: T | undefined) => ComputationResult<T>,
): Signal<T | undefined>;

// Options with `undefined` initial value and no `requireSync` -> `undefined`.
export function computedAsync<T>(
	computation: (previousValue?: T | undefined) => ComputationResult<T>,
	options: {
		initialValue?: undefined;
		requireSync?: false;
	} & ComputedAsyncOptions<T>,
): Signal<T | undefined>;

// Options with `null` initial value -> `null`.
export function computedAsync<T>(
	computation: (previousValue?: T | undefined) => ComputationResult<T>,
	options: {
		initialValue?: null;
		requireSync?: false;
	} & ComputedAsyncOptions<T>,
): Signal<T | null>;

// Options with `undefined` initial value and `requireSync` -> strict result type.
export function computedAsync<T>(
	computation: (previousValue?: T | undefined) => ComputationResult<T>,
	options: {
		initialValue?: undefined;
		requireSync: true;
	} & ComputedAsyncOptions<T>,
): Signal<T>;

// We don't support Promises with requireSync
export function computedAsync<T>(
	computation: (previousValue?: T | undefined) => Promise<T>,
	options: ComputedAsyncOptions<T> & { requireSync: true },
): never;

// Options with a more specific initial value type.
export function computedAsync<T, const U extends T>(
	computation: (previousValue?: T | undefined) => ComputationResult<T>,
	options: {
		initialValue: U;
		requireSync?: false;
	} & ComputedAsyncOptions<T>,
): Signal<T | U>;

export function computedAsync<T>(
	computation: (previousValue?: T | undefined) => ComputationResult<T>,
	options: ComputedAsyncOptions<T>,
): Signal<T>;

export function computedAsync<T, U = undefined>(
	computation: (previousValue?: T | undefined) => ComputationResult<T>,
	options?: ComputedAsyncOptions<T> & { initialValue?: U },
): Signal<T | U> {
	return assertInjector(computedAsync, options?.injector, () => {
		const destroyRef = inject(DestroyRef);

		// source$ is a Subject that will emit the new source value
		const sourceEvent$ = new Subject<Promise<T> | Observable<T>>();

		// sourceValue is a signal that will hold the current value and the state of the value
		let sourceValue: WritableSignal<State<T | U>>;

		if (options?.requireSync) {
			if (options.initialValue !== undefined) {
				sourceValue = signal<State<T | U>>({
					kind: StateKind.Value,
					value: options.initialValue as U,
				});
			} else {
				const newSource = computation(undefined);

				// we don't support promises with requireSync - fix Types to prevent this
				if (isPromise(newSource)) throw new Error(REQUIRE_SYNC_PROMISE_MESSAGE);

				sourceValue = signal<State<T | U>>({ kind: StateKind.NoValue });

				if (isObservable(newSource)) {
					newSource
						.subscribe({
							next: (value) =>
								sourceValue.set({ kind: StateKind.Value, value }),
							error: (error) =>
								sourceValue.set({ kind: StateKind.Error, error }),
						})
						.unsubscribe();
					if (sourceValue()!.kind === StateKind.NoValue) {
						throw new Error(REQUIRE_SYNC_ERROR_MESSAGE);
					}
				} else {
					sourceValue.set({ kind: StateKind.Value, value: newSource as T });
				}
			}
		} else {
			sourceValue = signal<State<T | U>>({
				kind: StateKind.Value,
				value: options?.initialValue as U,
			});
		}

		const effectRef = effect(
			() => {
				// we need to have an untracked() here because we don't want to register the sourceValue as a dependency
				// otherwise, we would have an infinite loop
				const currentState = untracked(() => sourceValue());
				const currentValue =
					currentState.kind === StateKind.Value
						? (currentState.value as T)
						: undefined;

				const newSource = computation(currentValue);

				if (!isObservable(newSource) && !isPromise(newSource)) {
					// if the new source is not an observable or a promise, we set the value immediately
					untracked(() =>
						sourceValue.set({ kind: StateKind.Value, value: newSource as T }),
					);
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
			next: (value) => sourceValue.set({ kind: StateKind.Value, value }),
			// NOTE: Error should be handled by the user (using catchError or .catch())
			error: (error) => sourceValue.set({ kind: StateKind.Error, error }),
		});

		destroyRef.onDestroy(() => {
			effectRef.destroy();
			sourceResult.unsubscribe();
		});

		if (options?.requireSync && sourceValue()!.kind === StateKind.NoValue) {
			throw new Error(REQUIRE_SYNC_ERROR_MESSAGE);
		}

		// we return a computed value that will return the current value
		// in order to support the same API as computed()
		return computed(
			() => {
				const state = sourceValue();
				switch (state.kind) {
					case StateKind.Value:
						return state.value as T;
					case StateKind.Error:
						throw state.error;
					case StateKind.NoValue:
						throw new Error(REQUIRE_SYNC_ERROR_MESSAGE);
				}
			},
			{ equal: options?.equal },
		);
	});
}

const REQUIRE_SYNC_PROMISE_MESSAGE = `Promises cannot be used with requireSync. Pass an initialValue or set requireSync to false.`;
const REQUIRE_SYNC_ERROR_MESSAGE = `The observable passed to computedAsync() did not emit synchronously. Pass an initialValue or set requireSync to false.`;

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

const enum StateKind {
	NoValue,
	Value,
	Error,
}

interface NoValueState {
	kind: StateKind.NoValue;
}

interface ValueState<T> {
	kind: StateKind.Value;
	value: T;
}

interface ErrorState {
	kind: StateKind.Error;
	error: unknown;
}

type State<T> = NoValueState | ValueState<T> | ErrorState;
