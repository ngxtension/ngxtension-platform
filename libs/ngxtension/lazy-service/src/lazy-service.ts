import { Injector, Type, runInInjectionContext } from '@angular/core';
import { assertInjector } from 'ngxtension/assert-injector';
import { Observable, defer } from 'rxjs';

/**
 * Loads a service lazily. The service is loaded when the observable is subscribed to.
 *
 * @param loader A function that returns a promise of the service to load.
 * @param injector The injector to use to load the service. If not provided, the current injector is used.
 * @returns An observable of the service.
 *
 * @example
 * ```ts
 * const dataService$ = lazyService(() => import('./data-service').then((m) => m.MyService));
 * or
 * const dataService$ = lazyService(() => import('./data-service'));
 * ```
 */
export function lazyService<T>(
	loader: () => Promise<Type<T>> | Promise<{ default: Type<T> }>,
	injector?: Injector
): Observable<T> {
	injector = assertInjector(lazyService, injector);

	return runInInjectionContext(injector, () => {
		return defer(() => {
			return loader()
				.then((serviceOrDefault) => {
					if ('default' in serviceOrDefault) {
						return injector!.get(serviceOrDefault.default);
					}
					return injector!.get(serviceOrDefault);
				})
				.catch((error) => {
					throw error;
				});
		});
	});
}
