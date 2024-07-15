import { concatMap, MonoTypeOperatorFunction, Observable, timer } from 'rxjs';
// source: https://netbasal.com/use-rxjs-to-modify-app-behavior-based-on-page-visibility-ce499c522be4

/**
 * RxJS operator to apply to a stream that you want to poll every "period" milliseconds after an optional "initialDelay" milliseconds.
 *
 * @param period - Indicates the delay between 2 polls.
 * @param initialDelay - Indicates the delay before the first poll occurs.
 * @example This example shows how to do an HTTP GET every 5 seconds:
 * ```ts
 * http.get('http://api').pipe(poll(5000)).subscribe(result => {});
 * ```
 * @public
 */
export function poll<T>(
	period: number,
	initialDelay = 0,
): MonoTypeOperatorFunction<T> {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
	return (source: Observable<T>) => {
		return timer(initialDelay, period).pipe(concatMap(() => source));
	};
}
