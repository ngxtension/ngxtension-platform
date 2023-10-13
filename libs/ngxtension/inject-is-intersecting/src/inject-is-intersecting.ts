import {
	DestroyRef,
	ElementRef,
	inject,
	Injector,
	runInInjectionContext,
} from '@angular/core';
import { assertInjector } from 'ngxtension/assert-injector';
import { injectDestroy } from 'ngxtension/inject-destroy';
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
 *     filter(x.intersectionRatio > 0),
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
export const injectIsIntersecting = (options?: InjectIsIntersectingOptions) => {
	const injector = assertInjector(injectDestroy, options?.injector);

	return runInInjectionContext(injector, () => {
		const el = options?.element ?? inject(ElementRef).nativeElement;
		const inInViewportService = inject(IsInViewportService);
		const destroyRef = inject(DestroyRef);

		const sub = inInViewportService.observe(el);

		destroyRef.onDestroy(() => {
			inInViewportService.unobserve(el);
		});

		return sub;
	});
};
