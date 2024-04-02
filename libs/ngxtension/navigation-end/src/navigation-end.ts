import { Injector, inject, runInInjectionContext } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, type Event } from '@angular/router';
import { assertInjector } from 'ngxtension/assert-injector';
import { filter, type Observable } from 'rxjs';

/**
 * Creates an Observable that emits when a navigation ends.
 * @returns An Observable of NavigationEnd events.
 */
export function injectNavigationEnd(
	injector?: Injector,
): Observable<NavigationEnd> {
	injector = assertInjector(injectNavigationEnd, injector);
	return runInInjectionContext(injector, () => {
		return inject(Router).events.pipe(
			filter(
				(event: Event): event is NavigationEnd =>
					event instanceof NavigationEnd,
			),
			takeUntilDestroyed(),
		);
	});
}
