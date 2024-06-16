import {
	InjectDocumentVisibilityOptions,
	injectDocumentVisibilityStream,
} from 'ngxtension/inject-document-visibility';
import {
	MonoTypeOperatorFunction,
	Observable,
	partition,
	repeat,
	takeUntil,
} from 'rxjs';

/**
 * RxJS operator to pause a stream when the document is hidden (i.e.: tab is not active)
 * and to resume the stream when the document is visible (i.e.: tab is active).
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
	const [pageVisible$, pageHidden$] = partition(visibilityChanged$, () => {
		return document.visibilityState === 'visible';
	});
	return (source: Observable<T>) => {
		return source.pipe(
			takeUntil(pageHidden$),
			repeat({ delay: () => pageVisible$ }),
		);
	};
}
