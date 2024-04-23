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

type derivedAsyncBehavior = 'switch' | 'merge' | 'concat' | 'exhaust';

interface derivedAsyncOptions<T> extends CreateComputedOptions<T> {
	injector?: Injector;
	behavior?: derivedAsyncBehavior;
}

type OptionsWithInitialValue<T> = { initialValue: T } & derivedAsyncOptions<T>;
type OptionsWithOptionalInitialValue<T> = {
	initialValue?: undefined;
} & derivedAsyncOptions<T>;
type OptionsWithRequireSync<T> = {
	requireSync: true;
} & derivedAsyncOptions<T>;

type ObservableComputation<T> = (
	previousValue?: T | undefined,
) => Observable<T> | T;

type PromiseComputation<T> = (previousValue?: T | undefined) => Promise<T> | T;

/**
 * A computed value that can be async! This is useful for when you need to compute a value based on a Promise or Observable.
 *
 * @example
 * ```ts
 * const value = derivedAsync(() =>
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
 * const value = derivedAsync(() =>
 *  this.http.get(`https://localhost/api/people/${this.userId()}`)
 * );
 * ```
 *
 * You can also pass an `initialValue` option to set the initial value of the computed value.
 *
 * ```ts
 * const userTasks = derivedAsync(() =>
 *   this.http.get(`https://localhost/api/tasks?userId=${this.userId()}`),
 *   { initialValue: [] }
 * );
 * ```
 *
 * If you want to require that the observable emits synchronously when `derivedAsync` subscribes, you can set the `requireSync` option to `true`.
 *
 * ```ts
 * const userTasks = derivedAsync(() =>
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

// Base Case -> Initial Value: undefined | Require Sync: undefined  ->  T | undefined
export function derivedAsync<T>(
	computation: (
		previousValue?: T | undefined,
	) => Promise<T> | Observable<T> | T | undefined,
): Signal<T | undefined>;

/*
 * Promise Types
 */

// Initial Value: undefined  ->  T | undefined
export function derivedAsync<T>(
	computation: (
		previousValue?: T | undefined,
	) => Observable<T> | Promise<T> | T | undefined,
	options: OptionsWithOptionalInitialValue<T>,
): Signal<T | undefined>;

// Initial Value: T | null  ->  T | null
export function derivedAsync<T>(
	computation: PromiseComputation<T>,
	options: { initialValue?: null } & derivedAsyncOptions<T>,
): Signal<T | null>;

// Initial Value: T  ->  T
export function derivedAsync<T>(
	computation: PromiseComputation<T>,
	options: OptionsWithInitialValue<T>,
): Signal<T>;

// Require Sync: true  ->  never
export function derivedAsync<T>(
	computation: (previousValue?: T | undefined) => Promise<T>,
	options: OptionsWithOptionalInitialValue<T> & {
		/**
		 * @throws Because the promise will not resolve synchronously.
		 */
		requireSync: true;
	},
): never;

export function derivedAsync<T>(
	computation: (previousValue?: T | undefined) => Promise<T>,
	options: OptionsWithInitialValue<T> & {
		/**
		 * @throws Because the promise will not resolve synchronously.
		 */
		requireSync: true;
	},
): never;

/*
 * Observable Types
 */

// Initial Value: undefined | Require Sync: false  ->  T | undefined
export function derivedAsync<T>(
	computation: (previousValue?: T | undefined) => Observable<T> | T | undefined,
	options: {
		initialValue?: undefined;
		requireSync?: false;
	} & derivedAsyncOptions<T>,
): Signal<T | undefined>;

// Initial Value: null | Require Sync: false  ->  T | null
export function derivedAsync<T>(
	computation: ObservableComputation<T>,
	options: {
		initialValue?: null;
		requireSync?: false;
	} & derivedAsyncOptions<T>,
): Signal<T | null>;

// Initial Value: undefined | Require Sync: true  ->  T
export function derivedAsync<T>(
	computation: ObservableComputation<T>,
	options: OptionsWithRequireSync<T> & { initialValue?: undefined },
): Signal<T>;

// Initial Value: T | Require Sync: true  ->  T
export function derivedAsync<T>(
	computation: ObservableComputation<T>,
	options: OptionsWithRequireSync<T> & { initialValue: T },
): Signal<T>;

// Initial Value: T | Require Sync: false | undefined  ->  T
export function derivedAsync<T>(
	computation: ObservableComputation<T>,
	options: OptionsWithInitialValue<T>,
): Signal<T>;

export function derivedAsync<T>(
	computation: (
		previousValue?: T | undefined,
	) => Promise<T> | Observable<T> | T | undefined,
	options: any = {},
): Signal<T | undefined> {
	return assertInjector(derivedAsync, options?.injector, () => {
		const destroyRef = inject(DestroyRef);

		// source$ is a Subject that will emit the new source value
		const sourceEvent$ = new Subject<Promise<T> | Observable<T>>();

		// enhance the sourceEvent$ with the behavior
		const source$: Observable<T> = createFlattenObservable(
			sourceEvent$,
			options?.behavior ?? 'switch',
		);

		const sourceResult = source$.subscribe({
			next: (value) => sourceValue.set({ kind: StateKind.Value, value }),
			// NOTE: Error should be handled by the user (using catchError or .catch())
			error: (error) => sourceValue.set({ kind: StateKind.Error, error }),
		});

		// we need to unsubscribe the sourceResult when the context gets destroyed
		destroyRef.onDestroy(() => sourceResult.unsubscribe());

		// sourceValue is a signal that will hold the current value and the state of the value
		let sourceValue: WritableSignal<State<T>>;

		if (options?.requireSync && options?.initialValue === undefined) {
			const initialCmp = computation(undefined);

			// we don't support promises with requireSync and no initialValue also the typings don't allow this case
			if (isPromise(initialCmp)) {
				throw new Error(REQUIRE_SYNC_PROMISE_MESSAGE);
			}

			sourceValue = signal<State<T>>({ kind: StateKind.NoValue });

			if (isObservable(initialCmp)) {
				sourceEvent$.next(initialCmp);
			} else {
				sourceValue.set({ kind: StateKind.Value, value: initialCmp as T });
			}
		} else {
			sourceValue = signal<State<T>>({
				kind: StateKind.Value,
				value: options?.initialValue,
			});
		}

		if (options?.requireSync && sourceValue().kind === StateKind.NoValue) {
			throw new Error(REQUIRE_SYNC_ERROR_MESSAGE);
		}

		let skipFirstComputation = options?.requireSync === true;

		// effect runs inside injection context, so it will be cleanup up when context gets destroyed
		effect(() => {
			// we need to have an untracked() here because we don't want to register the sourceValue as a dependency
			// otherwise, we would have an infinite loop.
			// this is needed for previousValue feature to work
			const currentValue = untracked(() => {
				const currentSourceValue = sourceValue();
				return currentSourceValue.kind === StateKind.Value
					? currentSourceValue.value
					: undefined;
			});

			const newSource = computation(currentValue);

			// we need to skip the first computation if requireSync is true
			// because we already computed the value in the previous step
			if (skipFirstComputation) {
				skipFirstComputation = false;
				return;
			}

			if (isObservable(newSource) || isPromise(newSource)) {
				// we untrack the source$.next() so that we don't register other signals as dependencies
				untracked(() => sourceEvent$.next(newSource));
			} else {
				// if the new source is not an observable or a promise, we set the value immediately
				untracked(() =>
					sourceValue.set({ kind: StateKind.Value, value: newSource as T }),
				);
			}
		});

		// we return a computed value that will return the current value
		// in order to support the same API as computed()
		return computed(
			() => {
				const state = sourceValue();
				switch (state.kind) {
					case StateKind.Value:
						return state.value;
					case StateKind.Error:
						throw state.error;
					case StateKind.NoValue:
						// we already throw an error if requireSync is true and there is no initialValue,
						// so we don't need to throw an error here
						return;
					default:
						// we should never reach this case
						throw new Error('Unknown state');
				}
			},
			{ equal: options?.equal },
		);
	});
}

const REQUIRE_SYNC_PROMISE_MESSAGE = `Promises cannot be used with requireSync. Pass an initialValue or set requireSync to false.`;
const REQUIRE_SYNC_ERROR_MESSAGE = `The observable passed to derivedAsync() did not emit synchronously. Pass an initialValue or set requireSync to false.`;

function createFlattenObservable<T>(
	source: Subject<Promise<T> | Observable<T>>,
	behavior: derivedAsyncBehavior,
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
