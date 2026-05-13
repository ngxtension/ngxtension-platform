import { DOCUMENT } from '@angular/common';
import {
	DestroyRef,
	type ElementRef,
	type Injector,
	type Signal,
	inject,
	signal,
} from '@angular/core';
import { assertInjector } from 'ngxtension/assert-injector';

// Ported from https://vueuse.org/core/useElementVisibility/

export interface InjectElementVisibilityOptions {
	/**
	 * Custom injector instance for dependency injection.
	 */
	injector?: Injector;
	/**
	 * The element to track visibility for. If not provided, will attempt to inject ElementRef.
	 */
	element?: Element | ElementRef<Element>;
	/**
	 * Custom window instance. Useful for testing or iframe scenarios.
	 */
	window?: Window;
	/**
	 * Initial value for visibility.
	 *
	 * @default false
	 */
	initialValue?: boolean;
	/**
	 * The element that is used as the viewport for checking visibility of the target.
	 */
	scrollTarget?: Element | null;
	/**
	 * Margin around the root. Can have values similar to the CSS margin property.
	 */
	rootMargin?: string;
	/**
	 * Either a single number or an array of numbers which indicate at what percentage
	 * of the target's visibility the observer's callback should be executed.
	 *
	 * @default 0
	 */
	threshold?: number | number[];
	/**
	 * Stop tracking when element visibility changes for the first time
	 *
	 * @default false
	 */
	once?: boolean;
}

/**
 * Tracks the visibility of an element within the viewport using IntersectionObserver.
 *
 * @example
 * ```ts
 * const isVisible = injectElementVisibility();
 *
 * effect(() => {
 *   console.log('Element is visible:', isVisible());
 * });
 * ```
 *
 * @param options Configuration options
 * @returns A readonly signal that emits true when the element is visible, false otherwise
 */
export function injectElementVisibility(
	options: InjectElementVisibilityOptions = {},
): Signal<boolean> {
	return assertInjector(injectElementVisibility, options.injector, () => {
		const {
			element: elementOption,
			window: customWindow,
			scrollTarget,
			threshold = 0,
			rootMargin,
			once = false,
			initialValue = false,
		} = options;

		const window: Window = customWindow ?? inject(DOCUMENT).defaultView!;
		const elementIsVisible = signal(initialValue);

		// Get the element from options or inject ElementRef
		let element: Element | null = null;
		if (elementOption) {
			element =
				elementOption instanceof ElementRef
					? elementOption.nativeElement
					: elementOption;
		} else {
			try {
				const elementRef = inject(ElementRef<Element>);
				element = elementRef.nativeElement;
			} catch {
				// If ElementRef is not available, element remains null
			}
		}

		// If no window or element, return the signal with initial value
		if (!window || !element) {
			return elementIsVisible.asReadonly();
		}

		// Check if IntersectionObserver is supported
		if (!('IntersectionObserver' in window)) {
			return elementIsVisible.asReadonly();
		}

		const observerOptions: IntersectionObserverInit = {
			root: scrollTarget,
			rootMargin,
			threshold,
		};

		let stopped = false;

		const observer = new IntersectionObserver(
			(entries: IntersectionObserverEntry[]) => {
				if (stopped) return;

				let isIntersecting = elementIsVisible();

				// Get the latest value of isIntersecting based on the entry time
				let latestTime = 0;
				for (const entry of entries) {
					if (entry.time >= latestTime) {
						latestTime = entry.time;
						isIntersecting = entry.isIntersecting;
					}
				}

				elementIsVisible.set(isIntersecting);

				if (once && isIntersecting) {
					stopped = true;
					observer.disconnect();
				}
			},
			observerOptions,
		);

		observer.observe(element);

		// Clean up on destroy
		const destroyRef = inject(DestroyRef);
		destroyRef.onDestroy(() => {
			stopped = true;
			observer.disconnect();
		});

		return elementIsVisible.asReadonly();
	});
}
