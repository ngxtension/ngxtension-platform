import { defer, MonoTypeOperatorFunction, Observable, tap } from 'rxjs';

/**
 * Executes the provided function only once when the first truthy value is emitted.
 * Uses `defer` to ensure state is unique per subscription.
 *
 * @param tapFn - Function to execute on the first truthy value.
 * @returns MonoTypeOperatorFunction
 */
export function tapOnceOnFirstTruthy<T>(
	tapFn: (t: T) => void,
): MonoTypeOperatorFunction<T> {
	return (source$: Observable<T>) =>
		defer(() => {
			let firstTruthy = true;
			return source$.pipe(
				tap((value) => {
					if (firstTruthy && !!value) {
						tapFn(value);
						firstTruthy = false;
					}
				}),
			);
		});
}

/**
 * Executes the provided function only once when the value at the specified index is emitted.
 * Uses `defer` to track index without the overhead of `concatMap`.
 *
 * @param tapFn - Function to execute on the value at the specified index.
 * @param tapIndex - Index at which to execute the function (default is 0).
 * @returns MonoTypeOperatorFunction
 */
export function tapOnce<T>(
	tapFn: (t: T) => void,
	tapIndex = 0,
): MonoTypeOperatorFunction<T> {
	if (tapIndex < 0) {
		throw new Error('tapIndex must be a non-negative integer');
	}

	return (source$: Observable<T>) =>
		defer(() => {
			let currentIndex = 0;
			return source$.pipe(
				tap((value) => {
					if (currentIndex === tapIndex) {
						tapFn(value);
					}
					currentIndex++;
				}),
			);
		});
}
