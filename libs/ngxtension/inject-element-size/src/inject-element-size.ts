import { DOCUMENT } from '@angular/common';
import {
	type ElementRef,
	type Injector,
	type Signal,
	inject,
	signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { assertInjector } from 'ngxtension/assert-injector';
import { Observable } from 'rxjs';

// Ported from https://vueuse.org/core/useElementSize/

export interface ElementSize {
	width: number;
	height: number;
}

export type ResizeObserverBoxOptions =
	| 'border-box'
	| 'content-box'
	| 'device-pixel-content-box';

export interface InjectElementSizeOptions {
	injector?: Injector;
	/**
	 * The initial size of the element
	 * @default { width: 0, height: 0 }
	 */
	initialSize?: ElementSize;
	/**
	 * The box model to use for the ResizeObserver
	 * @default 'content-box'
	 */
	box?: ResizeObserverBoxOptions;
	/**
	 * Custom window object
	 */
	window?: Window;
}

export interface ElementSizeState {
	/**
	 * The width of the element
	 */
	width: Signal<number>;
	/**
	 * The height of the element
	 */
	height: Signal<number>;
}

/**
 * Reactive size of an HTML element using ResizeObserver.
 *
 * @example
 * ```ts
 * const elementRef = viewChild<ElementRef>('myElement');
 * const size = injectElementSize(elementRef);
 *
 * effect(() => {
 *   console.log('Width:', size.width());
 *   console.log('Height:', size.height());
 * });
 * ```
 *
 * @param target - The target element to observe. Can be an ElementRef, a Signal<ElementRef>, or undefined
 * @param options - Options for the element size observation
 * @returns An object containing readonly signals for width and height
 */
export function injectElementSize(
	target: ElementRef<HTMLElement> | Signal<ElementRef<HTMLElement> | undefined>,
	options: InjectElementSizeOptions = {},
): Readonly<ElementSizeState> {
	return assertInjector(injectElementSize, options.injector, () => {
		const {
			initialSize = { width: 0, height: 0 },
			box = 'content-box',
			window: customWindow,
		} = options;

		const document = inject(DOCUMENT);
		const window = customWindow ?? document.defaultView!;

		const width = signal(initialSize.width);
		const height = signal(initialSize.height);

		// Helper to get the native element from target
		const getElement = (): HTMLElement | null => {
			if (typeof target === 'function') {
				// It's a signal
				const ref = target();
				return ref?.nativeElement ?? null;
			} else {
				// It's an ElementRef
				return target.nativeElement ?? null;
			}
		};

		// Check if element is SVG
		const isSVG = (element: HTMLElement | null): boolean => {
			return element?.namespaceURI?.includes('svg') ?? false;
		};

		// Helper function to handle array or single boxSize
		const toArray = <T>(value: T | T[]): T[] => {
			return Array.isArray(value) ? value : [value];
		};

		// Initialize with current size
		const element = getElement();
		if (element) {
			if ('offsetWidth' in element) {
				width.set((element as HTMLElement).offsetWidth);
			}
			if ('offsetHeight' in element) {
				height.set((element as HTMLElement).offsetHeight);
			}
		}

		// Create ResizeObserver if available
		if (window && 'ResizeObserver' in window) {
			const resizeObserver = new ResizeObserver((entries) => {
				const entry = entries[0];
				if (!entry) return;

				const currentElement = getElement();
				if (!currentElement) {
					width.set(initialSize.width);
					height.set(initialSize.height);
					return;
				}

				const boxSize =
					box === 'border-box'
						? entry.borderBoxSize
						: box === 'content-box'
							? entry.contentBoxSize
							: entry.devicePixelContentBoxSize;

				if (window && isSVG(currentElement)) {
					// For SVG elements, use getBoundingClientRect
					const rect = currentElement.getBoundingClientRect();
					width.set(rect.width);
					height.set(rect.height);
				} else {
					if (boxSize) {
						const formatBoxSize = toArray(boxSize);
						width.set(
							formatBoxSize.reduce(
								(acc, { inlineSize }) => acc + inlineSize,
								0,
							),
						);
						height.set(
							formatBoxSize.reduce((acc, { blockSize }) => acc + blockSize, 0),
						);
					} else {
						// Fallback to contentRect
						width.set(entry.contentRect.width);
						height.set(entry.contentRect.height);
					}
				}
			});

			// Create an observable to track element changes if target is a signal
			if (typeof target === 'function') {
				// Watch for element changes
				new Observable<HTMLElement | null>((subscriber) => {
					const checkElement = () => {
						const element = getElement();
						subscriber.next(element);
					};

					// Initial check
					checkElement();

					// Use effect to watch signal changes - but we need to do this outside Observable
					// So we'll use a different approach with an interval or manual tracking
					const interval = setInterval(checkElement, 100);

					return () => {
						clearInterval(interval);
					};
				})
					.pipe(takeUntilDestroyed())
					.subscribe((element) => {
						// Disconnect previous observations
						resizeObserver.disconnect();

						if (element) {
							// Update to current size immediately
							if ('offsetWidth' in element) {
								width.set((element as HTMLElement).offsetWidth);
							}
							if ('offsetHeight' in element) {
								height.set((element as HTMLElement).offsetHeight);
							}
							resizeObserver.observe(element, { box });
						} else {
							width.set(initialSize.width);
							height.set(initialSize.height);
						}
					});
			} else {
				// Static ElementRef - just observe it
				const element = getElement();
				if (element) {
					resizeObserver.observe(element, { box });
				}

				// Cleanup on destroy
				new Observable<never>((subscriber) => {
					return () => {
						resizeObserver.disconnect();
					};
				})
					.pipe(takeUntilDestroyed())
					.subscribe();
			}
		}

		return {
			width: width.asReadonly(),
			height: height.asReadonly(),
		};
	});
}
