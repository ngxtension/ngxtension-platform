import { MonoTypeOperatorFunction, concatMap, of, type Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Executes the provided function only once when the first truthy value is emitted.
 * @param tapFn - Function to execute on the first truthy value.
 * @returns MonoTypeOperatorFunction
 */
export function tapOnceOnFirstTruthy<T>(
	tapFn: (t: T) => void,
): MonoTypeOperatorFunction<T> {
	let firstTruthy = true;
	return (source$: Observable<T>) =>
		source$.pipe(
			tap((value) => {
				if (firstTruthy && !!value) {
					tapFn(value);
					firstTruthy = false;
				}
			}),
		);
}

/**
 * Executes the provided function only once when the value at the specified index is emitted.
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
		source$.pipe(
			concatMap((value, index) => {
				if (index === tapIndex) {
					tapFn(value);
				}
				return of(value);
			}),
		);
}
