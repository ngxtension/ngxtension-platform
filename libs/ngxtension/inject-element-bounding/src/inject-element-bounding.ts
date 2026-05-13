import { DOCUMENT } from '@angular/common';
import {
	DestroyRef,
	type ElementRef,
	type Injector,
	type Signal,
	afterNextRender,
	inject,
	signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { assertInjector } from 'ngxtension/assert-injector';
import { fromEvent, merge } from 'rxjs';

// Ported from https://vueuse.org/core/useElementBounding/

export interface InjectElementBoundingOptions {
	injector?: Injector;
	/**
	 * Reset values to 0 on component unmounted
	 *
	 * @default true
	 */
	reset?: boolean;
	/**
	 * Listen to window resize event
	 *
	 * @default true
	 */
	windowResize?: boolean;
	/**
	 * Listen to window scroll event
	 *
	 * @default true
	 */
	windowScroll?: boolean;
	/**
	 * Immediately call update on component mounted
	 *
	 * @default true
	 */
	immediate?: boolean;
	/**
	 * Timing to recalculate the bounding box
	 *
	 * @default 'sync'
	 */
	updateTiming?: 'sync' | 'next-frame';
}

export interface InjectElementBoundingReturn {
	height: Signal<number>;
	bottom: Signal<number>;
	left: Signal<number>;
	right: Signal<number>;
	top: Signal<number>;
	width: Signal<number>;
	x: Signal<number>;
	y: Signal<number>;
	update: () => void;
}

/**
 * Reactive bounding box of an HTML element.
 *
 * @example
 * ```ts
 * const elementRef = viewChild<ElementRef<HTMLDivElement>>('target');
 * const bounding = injectElementBounding(elementRef);
 *
 * effect(() => {
 *   console.log('Width:', bounding.width());
 *   console.log('Height:', bounding.height());
 *   console.log('Top:', bounding.top());
 *   console.log('Left:', bounding.left());
 * });
 * ```
 *
 * @param target Element reference or signal returning an element
 * @param options Configuration options
 *
 * @returns An object containing reactive bounding box properties and an update function
 */
export function injectElementBounding(
	target: Signal<ElementRef<HTMLElement> | HTMLElement | null | undefined>,
	options: InjectElementBoundingOptions = {},
): InjectElementBoundingReturn {
	return assertInjector(injectElementBounding, options.injector, () => {
		const {
			reset = true,
			windowResize = true,
			windowScroll = true,
			immediate = true,
			updateTiming = 'sync',
		} = options;

		const document = inject(DOCUMENT);
		const window = document.defaultView;

		const height = signal(0);
		const bottom = signal(0);
		const left = signal(0);
		const right = signal(0);
		const top = signal(0);
		const width = signal(0);
		const x = signal(0);
		const y = signal(0);

		function getElement(): HTMLElement | null {
			const value = target();
			if (!value) return null;
			return value instanceof ElementRef ? value.nativeElement : value;
		}

		function recalculate() {
			const el = getElement();

			if (!el) {
				if (reset) {
					height.set(0);
					bottom.set(0);
					left.set(0);
					right.set(0);
					top.set(0);
					width.set(0);
					x.set(0);
					y.set(0);
				}
				return;
			}

			const rect = el.getBoundingClientRect();

			height.set(rect.height);
			bottom.set(rect.bottom);
			left.set(rect.left);
			right.set(rect.right);
			top.set(rect.top);
			width.set(rect.width);
			x.set(rect.x);
			y.set(rect.y);
		}

		function update() {
			if (updateTiming === 'sync') {
				recalculate();
			} else if (updateTiming === 'next-frame') {
				requestAnimationFrame(() => recalculate());
			}
		}

		// Use ResizeObserver for element size changes
		const resizeObserver = new ResizeObserver(() => update());

		// Use MutationObserver for style/class changes
		const mutationObserver = new MutationObserver(() => update());

		afterNextRender(() => {
			const el = getElement();
			if (el) {
				resizeObserver.observe(el);
				mutationObserver.observe(el, {
					attributes: true,
					attributeFilter: ['style', 'class'],
				});
			}

			if (immediate) {
				update();
			}
		});

		// Setup event listeners for window scroll and resize
		if (window) {
			const events = [];

			if (windowScroll) {
				events.push(
					fromEvent(window, 'scroll', { capture: true, passive: true }),
				);
			}

			if (windowResize) {
				events.push(fromEvent(window, 'resize', { passive: true }));
			}

			if (events.length > 0) {
				merge(...events)
					.pipe(takeUntilDestroyed())
					.subscribe(() => update());
			}
		}

		// Cleanup observers on destroy
		const destroyRef = inject(DestroyRef);
		destroyRef.onDestroy(() => {
			resizeObserver.disconnect();
			mutationObserver.disconnect();
		});

		return {
			height: height.asReadonly(),
			bottom: bottom.asReadonly(),
			left: left.asReadonly(),
			right: right.asReadonly(),
			top: top.asReadonly(),
			width: width.asReadonly(),
			x: x.asReadonly(),
			y: y.asReadonly(),
			update,
		};
	});
}
