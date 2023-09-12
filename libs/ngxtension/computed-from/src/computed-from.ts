import { Injector, isSignal, Signal, untracked } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { assertInjector } from 'ngxtension/assert-injector';
import {
	combineLatest,
	distinctUntilChanged,
	from,
	isObservable,
	ObservableInput,
	of,
	OperatorFunction,
	take,
} from 'rxjs';

export type ObservableSignalInput<T> = ObservableInput<T> | Signal<T>;

/**
 * So that we can have `fn([Observable<A>, Signal<B>]): Observable<[A, B]>`
 */
type ObservableSignalInputTuple<T> = {
	[K in keyof T]: ObservableSignalInput<T[K]>;
};

export function computedFrom<Input extends readonly unknown[], Output = Input>(
	sources: readonly [...ObservableSignalInputTuple<Input>],
	operator?: OperatorFunction<Input, Output>,
	injector?: Injector
): Signal<Output>;

export function computedFrom<Input extends object, Output = Input>(
	sources: ObservableSignalInputTuple<Input>,
	operator?: OperatorFunction<Input, Output>,
	injector?: Injector
): Signal<Output>;

/**
 * `computedFrom` is a function that takes an array/object with `Observable` or `Signal` values and returns a `Signal` that
 * emits the values of the `Observable` or `Signal` values. It is similar to `combineLatest` but it will emit
 * when the value of the `Observable` or `Signal` changes.
 *
 * @param {ObservableSignalInputTuple} sources - array/object of `Observable` or `Signal` values
 * @param {OperatorFunction} [operator] - operator to apply to the `Observable` or `Signal` values
 * @param {Injector} [injector] - injector to use to inject the `Observable` or `Signal` values
 * @returns {Signal} - `Signal` that emits the values of the `Observable` or `Signal` values
 *
 * @example
 *
 * ```ts
 * export class MyComponent {
 *  private readonly filtersService = inject(FiltersService);
 *  readonly pageNumber = signal(1);
 *
 *  readonly data = computedFrom(
 *   [this.pageNumber, this.filtersService.filters$],
 *   pipe(
 *     switchMap(([pageNumber, filters]) => this.dataService.getData(pageNumber, filters)),
 *     startWith([])
 *   );
 * }
 * ```
 */
export function computedFrom(
	sources: any,
	operator?: OperatorFunction<any, any>,
	injector?: Injector
): Signal<any> {
	injector = assertInjector(computedFrom, injector);

	let { normalizedSources, initialValues } = Object.entries(sources).reduce(
		(acc, [keyOrIndex, source]) => {
			if (isSignal(source)) {
				acc.normalizedSources[keyOrIndex] = toObservable(source, { injector });
				acc.initialValues[keyOrIndex] = untracked(source);
			} else if (isObservable(source)) {
				acc.normalizedSources[keyOrIndex] = source.pipe(distinctUntilChanged());
				source.pipe(take(1)).subscribe((attemptedSyncValue) => {
					if (acc.initialValues[keyOrIndex] !== null) {
						acc.initialValues[keyOrIndex] = attemptedSyncValue;
					}
				});
				acc.initialValues[keyOrIndex] ??= null;
			} else {
				acc.normalizedSources[keyOrIndex] = from(source as any).pipe(
					distinctUntilChanged()
				);
				acc.initialValues[keyOrIndex] = null;
			}

			return acc;
		},
		{
			normalizedSources: Array.isArray(sources) ? [] : {},
			initialValues: Array.isArray(sources) ? [] : {},
		} as {
			normalizedSources: any;
			initialValues: any;
		}
	);

	normalizedSources = combineLatest(normalizedSources);
	if (operator) {
		normalizedSources = normalizedSources.pipe(operator);
		operator(of(initialValues))
			.pipe(take(1))
			.subscribe((newInitialValues) => {
				initialValues = newInitialValues;
			});
	}

	return toSignal(normalizedSources, { initialValue: initialValues, injector });
}
