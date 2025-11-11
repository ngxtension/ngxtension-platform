import {
	combineLatest,
	debounce,
	distinctUntilChanged,
	map,
	merge,
	MonoTypeOperatorFunction,
	Observable,
	OperatorFunction,
	ReplaySubject,
	share,
	startWith,
	takeUntil,
	timer,
} from 'rxjs';

export type DeriveLoadingOptions = {
	/**
	 * The time in milliseconds to wait before emiting the loading flag = true.
	 */
	threshold?: number;
	/**
	 * The time in milliseconds to wait before emiting the loading flag = false.
	 */
	loadingTime?: number;
};

/**
 * Derive a loading state from the source observable.
 *
 * It will emit a loading flag in a "non-flickering" way. This means
 * if the async operation finishes before the threshold time, the loading flag will not change
 * to "true", it will stay false.
 *
 * It will only emit "true" when the async operation takes longer than the threshold time.
 * It will change back to "false" after at least the defined threshold + loadingTime has passed.
 * If the async operation takes longer than threshold + loadingtime, "false" will be emitted after the operation
 * has finished.
 *
 * @param options - The options to configure the loading state derivation.
 * @returns A observable that emits the loading flag.
 *
 * @param options
 */
export function deriveLoading<T>(
	options?: DeriveLoadingOptions,
): OperatorFunction<T, boolean> {
	const threshold = options?.threshold ?? 500;
	const loadingTime = options?.loadingTime ?? 1000;

	return function <T>(source: Observable<T>): Observable<boolean> {
		const result$ = source.pipe(
			share({
				connector: () => new ReplaySubject(1),
				resetOnComplete: false,
				resetOnRefCountZero: true,
				resetOnError: true,
			}),
		);

		return merge(
			timer(threshold).pipe(
				map(() => true),
				takeUntil(result$),
			),
			combineLatest([result$, timer(threshold + loadingTime)]).pipe(
				map(() => false),
			),
		).pipe(startWith(false), distinctUntilChanged(), handleSyncValue());
	};
}

function handleSyncValue<T>(): MonoTypeOperatorFunction<any> {
	return (source$: Observable<T>): Observable<T> => {
		return new Observable<T>((observer) => {
			const isReadySubject = new ReplaySubject<unknown>(1);

			const subscription = source$
				.pipe(
					/* Wait for all synchronous processing to be done. */
					debounce(() => isReadySubject),
				)
				.subscribe(observer);

			/* Sync emitted values have been processed now.
			 * Mark source as ready and emit last computed state. */
			isReadySubject.next(undefined);

			return () => subscription.unsubscribe();
		});
	};
}
