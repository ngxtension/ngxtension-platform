import { DOCUMENT } from '@angular/common';
import {
	type Injector,
	type Signal,
	effect,
	inject,
	signal,
} from '@angular/core';
import { assertInjector } from 'ngxtension/assert-injector';
import { type Subscription, fromEvent } from 'rxjs';

// Ported from https://vueuse.org/core/useMediaQuery/

export interface InjectMediaQueryOptions {
	/**
	 * Custom injector
	 */
	injector?: Injector;
	/**
	 * Custom window object
	 */
	window?: Window;
}

/**
 * Converts a pixel value string to a number
 * @param value - The pixel value as a string (e.g., "768px", "10rem")
 * @returns The numeric value in pixels
 */
function pxValue(value: string): number {
	const trimmed = value.trim();

	if (trimmed.endsWith('px')) {
		return Number.parseFloat(trimmed);
	}

	if (trimmed.endsWith('rem')) {
		const fontSize =
			typeof window !== 'undefined'
				? Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
				: 16;
		return Number.parseFloat(trimmed) * fontSize;
	}

	if (trimmed.endsWith('em')) {
		const fontSize =
			typeof window !== 'undefined'
				? Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
				: 16;
		return Number.parseFloat(trimmed) * fontSize;
	}

	return Number.parseFloat(trimmed);
}

/**
 * Reactive Media Query using `window.matchMedia`.
 *
 * Returns a readonly Signal<boolean> that indicates whether the media query matches.
 * Automatically listens to 'change' events for reactive updates.
 *
 * @example
 * ```ts
 * const isLargeScreen = injectMediaQuery('(min-width: 1024px)');
 * const isPreferredDark = injectMediaQuery('(prefers-color-scheme: dark)');
 *
 * effect(() => {
 *   console.log('Is large screen:', isLargeScreen());
 *   console.log('Prefers dark mode:', isPreferredDark());
 * });
 * ```
 *
 * @param query - The media query string to evaluate (e.g., '(min-width: 768px)')
 * @param options - Configuration options
 * @returns A readonly Signal<boolean> that emits true when the media query matches
 */
export function injectMediaQuery(
	query: string | Signal<string>,
	options: InjectMediaQueryOptions = {},
): Signal<boolean> {
	return assertInjector(injectMediaQuery, options.injector, () => {
		const document = inject(DOCUMENT);
		const window = options.window ?? document.defaultView;

		const isSupported =
			!!window &&
			'matchMedia' in window &&
			typeof window.matchMedia === 'function';

		const matches = signal(false);

		if (!isSupported) {
			return matches.asReadonly();
		}

		let mediaQuery: MediaQueryList | null = null;

		const handler = (event: MediaQueryListEvent) => {
			matches.set(event.matches);
		};

		// Effect to handle query changes and set up listeners
		effect((onCleanup) => {
			const queryString = typeof query === 'function' ? query() : query;

			if (!window || !queryString) {
				matches.set(false);
				return;
			}

			// Create new MediaQueryList
			mediaQuery = window.matchMedia(queryString);
			matches.set(mediaQuery.matches);

			// Set up change listener
			const subscription: Subscription = fromEvent<MediaQueryListEvent>(
				mediaQuery,
				'change',
			).subscribe(handler);

			// Clean up subscription when effect is cleaned up
			onCleanup(() => subscription.unsubscribe());
		});

		return matches.asReadonly();
	});
}
