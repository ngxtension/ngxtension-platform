import { DOCUMENT } from '@angular/common';
import { type Injector, type Signal, computed, inject } from '@angular/core';
import { assertInjector } from 'ngxtension/assert-injector';

// Ported from https://vueuse.org/core/useShare/

export interface InjectShareOptions {
	/**
	 * Title to share
	 */
	title?: string;
	/**
	 * Files to share
	 */
	files?: File[];
	/**
	 * Text to share
	 */
	text?: string;
	/**
	 * URL to share
	 */
	url?: string;
}

export interface InjectShareParams {
	/**
	 * Default share options
	 */
	shareOptions?: InjectShareOptions;
	/**
	 * Specify a custom `Injector` instance for dependency injection.
	 */
	injector?: Injector;
}

export interface InjectShareReturn {
	/**
	 * Whether the Web Share API is supported.
	 */
	isSupported: Signal<boolean>;
	/**
	 * Share content using the Web Share API.
	 * @param overrideOptions - Optional override options to merge with default options
	 */
	share: (overrideOptions?: InjectShareOptions) => Promise<void>;
}

interface NavigatorWithShare {
	share?: (data: InjectShareOptions) => Promise<void>;
	canShare?: (data: InjectShareOptions) => boolean;
}

/**
 * Reactive Web Share API for Angular.
 *
 * The Web Share API allows sharing text, URLs, and files. The share() method
 * must be called following a user gesture like a button click. It can't be
 * called on page load to prevent abuse.
 *
 * @example
 * ```ts
 * const { share, isSupported } = injectShare();
 *
 * async function startShare() {
 *   await share({
 *     title: 'Hello',
 *     text: 'Hello my friend!',
 *     url: location.href,
 *   });
 * }
 * ```
 *
 * @example
 * ```ts
 * // With default options
 * const shareOptions = signal<InjectShareOptions>({ text: 'foo' });
 * const { share, isSupported } = injectShare({ shareOptions: shareOptions() });
 *
 * // Override on share
 * await share({ text: 'bar' });
 * ```
 *
 * @param params - Configuration parameters
 * @returns An object containing isSupported signal and share method
 */
export function injectShare(params: InjectShareParams = {}): InjectShareReturn {
	return assertInjector(injectShare, params.injector, () => {
		const document = inject(DOCUMENT);
		const navigator = document.defaultView?.navigator as
			| NavigatorWithShare
			| undefined;

		const isSupported = computed(
			() => navigator != null && 'canShare' in navigator,
		);

		const share = async (
			overrideOptions: InjectShareOptions = {},
		): Promise<void> => {
			if (!isSupported()) {
				return;
			}

			const data = {
				...params.shareOptions,
				...overrideOptions,
			};

			let granted = false;

			if (navigator?.canShare) {
				granted = navigator.canShare(data);
			}

			if (granted && navigator?.share) {
				await navigator.share(data);
			}
		};

		return {
			isSupported,
			share,
		};
	});
}
