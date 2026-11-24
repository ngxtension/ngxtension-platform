import {
	InjectDocumentVisibilityOptions,
	injectDocumentVisibilityStream,
} from 'ngxtension/inject-document-visibility';
import {
	dematerialize,
	distinctUntilChanged,
	materialize,
	MonoTypeOperatorFunction,
	NEVER,
	Observable,
	switchMap,
} from 'rxjs';

/**
 * RxJS operator to pause a stream when the document is hidden (i.e.: tab is not active)
 * and to resume the stream when the document is visible (i.e.: tab is active).
 *
 * Resuming re-subscribes to the source. When the source completes or errors on its own,
 * the resulting stream completes or errors too, and the source is not re-subscribed.
 *
 * @example This example shows how to do an HTTP GET every 5 seconds only when the page is visible in the browser:
 * ```typescript
 * http.get('http://api').pipe(poll(5000), whenPageVisible()).subscribe(result => {})
 * ```
 * @public
 */
export function whenDocumentVisible<T>(
	options?: InjectDocumentVisibilityOptions,
): MonoTypeOperatorFunction<T> {
	const visibilityChanged$ = injectDocumentVisibilityStream(options);
	return (source: Observable<T>) => {
		return visibilityChanged$.pipe(
			distinctUntilChanged(),
			// subscribe to the source while visible, unsubscribe (pause) while hidden;
			// materialize keeps the source's complete/error notifications so they end the stream
			switchMap((visibilityState) =>
				visibilityState === 'visible' ? source.pipe(materialize()) : NEVER,
			),
			dematerialize(),
		);
	};
}
