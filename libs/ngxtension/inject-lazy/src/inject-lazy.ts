import { Injector } from '@angular/core';
import { assertInjector } from 'ngxtension/assert-injector';
import { Observable } from 'rxjs';
import type { LazyImportLoaderFn } from './inject-lazy-impl';
import { InjectLazyImpl } from './inject-lazy-impl';

/**
 * Loads a service lazily. The service is loaded when the observable is subscribed to.
 *
 * @param loader A function that returns a promise of the service to load.
 * @param injector The injector to use to load the service. If not provided, the current injector is used.
 * @returns An observable of the service.
 *
 * @example
 * ```ts
 * const dataService$ = injectLazy(() => import('./data-service').then((m) => m.MyService));
 * or
 * const dataService$ = injectLazy(() => import('./data-service'));
 * ```
 */
export function injectLazy<T>(
	loader: LazyImportLoaderFn<T>,
	injector?: Injector
): Observable<T> {
	injector = assertInjector(injectLazy, injector);
	const injectImpl = injector.get<InjectLazyImpl<T>>(InjectLazyImpl);
	return injectImpl.get(injector, loader);
}
