import { DestroyRef, ElementRef, inject, Injector } from '@angular/core';
import { assertInjector } from 'ngxtension/assert-injector';
import { Observable } from 'rxjs';
import { IsInViewportService } from './is-in-viewport.service';

export interface InjectIsIntersectingOptions {
	injector?: Injector;
	element?: Element;
}

/**
 * Injects an observable that emits whenever the element is intersecting the viewport.
 * The observable will complete when the element is destroyed.
 * @param options
 *
 * @example
 * export class MyComponent {
 *   private destroyRef = inject(DestroyRef);
 *
 *   isIntersecting$ = injectIsIntersecting();
 *   isInViewport$ = this.isIntersecting$.pipe(
 *     filter(x => x.intersectionRatio > 0),
 *     take(1),
 *   );
 *
 *   ngOnInit() {
 *     this.getData().subscribe();
 *   }
 *
 *   getData() {
 *     // Only fetch data when the element is in the viewport
 *     return this.isInViewport$.pipe(
 *       switchMap(() => this.service.getData()),
 *       takeUntil(this.destroy$)
 *     );
 *   }
 * }
 */
export const injectIsIntersecting = ({
	injector,
	element,
}: InjectIsIntersectingOptions = {}): Observable<IntersectionObserverEntry> => {
	return assertInjector(injectIsIntersecting, injector, () => {
		const el = element ?? inject(ElementRef<Element>).nativeElement;
		const isInViewportService = inject(IsInViewportService);
		const destroyRef = inject(DestroyRef);

		const obs$ = isInViewportService.observe(el);

		destroyRef.onDestroy(() => isInViewportService.unobserve(el));

		return obs$;
	});
};
