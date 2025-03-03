import {
	combineLatestWith,
	concatMap,
	Observable,
	ObservableInput,
	ObservedValueOf,
	of,
	OperatorFunction,
	take,
} from 'rxjs';

export function takeLatestFrom<T extends Observable<unknown>[], V>(
	observablesFactory: (value: V) => [...T],
): OperatorFunction<V, [V, ...{ [i in keyof T]: ObservedValueOf<T[i]> }]>;
export function takeLatestFrom<T extends Observable<unknown>, V>(
	observableFactory: (value: V) => T,
): OperatorFunction<V, [V, ObservedValueOf<T>]>;

/**
 * Every time the source observable emits, `takeLatestFrom()` waits
 * for the provided observables to emit a value, and when each of
 * them has emitted, `takeLatestFrom()` emits and unsubscribes
 * from the provided observables.
 */
export function takeLatestFrom<
	T extends ObservableInput<unknown>[] | ObservableInput<unknown>,
	V,
	R = [
		V,
		...(T extends ObservableInput<unknown>[]
			? { [i in keyof T]: ObservedValueOf<T[i]> }
			: [ObservedValueOf<T>]),
	],
>(observablesFactory: (value: V) => T): OperatorFunction<V, R> {
	return concatMap((value) => {
		const observables = observablesFactory(value);
		const observablesAsArray = Array.isArray(observables)
			? observables
			: [observables];

		return of(value).pipe(
			combineLatestWith(...observablesAsArray),
			take(1),
		) as unknown as Observable<R>;
	});
}
