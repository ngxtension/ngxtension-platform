import {
	combineLatestWith,
	concatMap,
	type Observable,
	type ObservableInput,
	type ObservedValueOf,
	of,
	type OperatorFunction,
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
 *
 * Let's say we have a source observable `src$` and a provided observable `data$`.
 *
 * ```ts
 * src$.pipe(withLatestFrom(data$)).subscribe();
 * ```
 *
 * Cases when `withLatestFrom()` will not emit when `src$` emits:
 *
 * - if `data$` is a cold observable and emitted before `src$` emitted;
 * - if `data$` emitted after `src$` emitted (`data$` can be hot or cold).
 *
 * In the first case, `withLatestFrom()` will wait for the next `data$` value to emit,
 * and `takeLatestFrom()` will do the same.
 *
 * In the second case, `withLatestFrom()` will wait for the next `src$` value to emit,
 * and `takeLatestFrom()` will emit at the moment when `data$` emits its value.
 *
 * You would use `takeLatestFrom()` when you have some observable, and every time it emits,
 * you want to attach the latest values from some other observables and handle them.
 * If these other observables don't have a value yet, you would like to wait until they emit at least one value (each).
 *
 * Example:
 *
 * ```ts
 * class ExampleStore {
 *  private readonly dataSrv = inject(DataService);
 *  private readonly userSrv = inject(UserService);
 *
 *  public readonly updateData = createEffect<DataType>((_) =>
 *    _.pipe(
 *      takeLatestFrom(() => [this.dataSrv.getData(), this.userSrv.getUser()]),
 *      exhaustMap(([newData, oldData, user]) =>
 *        this.dataSrv.updateData(merge({}, oldData, newData), user),
 *      ),
 *    ),
 *  );
 * }
 * ```
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
