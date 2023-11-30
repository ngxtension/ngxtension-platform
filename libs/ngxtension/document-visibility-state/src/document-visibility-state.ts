import { DOCUMENT } from '@angular/common';
import {
	Injector,
	inject,
	runInInjectionContext,
	type Signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { assertInjector } from 'ngxtension/assert-injector';
import { Observable, fromEvent, map, startWith } from 'rxjs';

export interface InjectDocumentVisibilityOptions {
	/*
	 * Specify a custom `document` instance, e.g. working with iframes or in testing environments.
	 */
	document?: Document;

	/*
	 * Specify a custom `Injector` instance to use for dependency injection.
	 */
	injector?: Injector;
}

/**
 * Injects and monitors the current document visibility state. Emits the state initially and then emits on every change.
 *
 * This function is useful for scenarios like tracking user presence on a page (e.g., for analytics or pausing/resuming activities) and is adaptable for use with iframes or in testing environments.
 *
 * @example
 * ```ts
 const visibilityState = injectDocumentVisibility();
 effect(() => {
   console.log(this.visibilityState());
 });
 * ```
 *
 * @param options An optional object with the following properties:
 *   - `document`: (Optional) Specifies a custom `Document` instance. This is useful when working with iframes or in testing environments where the global `document` might not be appropriate.
 *   - `injector`: (Optional) Specifies a custom `Injector` instance for dependency injection. This allows for more flexible and testable code by decoupling from a global state or context.
 *
 * @returns A signal that emits the current `DocumentVisibilityState` (`"visible"`, `"hidden"`, etc.) initially and whenever the document visibility state changes.
 */

export function injectDocumentVisibility(
	options?: InjectDocumentVisibilityOptions
): Signal<DocumentVisibilityState> {
	const injector = assertInjector(injectDocumentVisibility, options?.injector);

	return runInInjectionContext(injector, () => {
		const doc: Document = options?.document ?? inject(DOCUMENT);

		const docVisible$: Observable<DocumentVisibilityState> = fromEvent(
			doc,
			'visibilitychange'
		).pipe(
			startWith(doc.visibilityState),
			map(() => doc.visibilityState)
		);

		return toSignal<DocumentVisibilityState>(docVisible$, {
			requireSync: true,
		});
	});
}
