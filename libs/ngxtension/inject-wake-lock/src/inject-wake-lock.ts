import { DOCUMENT } from '@angular/common';
import {
	type Injector,
	type Signal,
	computed,
	effect,
	inject,
	signal,
	untracked,
} from '@angular/core';
import { assertInjector } from 'ngxtension/assert-injector';
import { injectDocumentVisibility } from 'ngxtension/inject-document-visibility';
import { fromEvent } from 'rxjs';

// Ported from https://vueuse.org/core/useWakeLock/

type WakeLockType = 'screen';

export interface WakeLockSentinel extends EventTarget {
	type: WakeLockType;
	released: boolean;
	release: () => Promise<void>;
}

type NavigatorWithWakeLock = Navigator & {
	wakeLock: { request: (type: WakeLockType) => Promise<WakeLockSentinel> };
};

export interface InjectWakeLockOptions {
	/**
	 * Specify a custom `Navigator` instance, e.g. in testing environments.
	 */
	navigator?: Navigator;

	/**
	 * Specify a custom `Document` instance, e.g. working with iframes or in testing environments.
	 */
	document?: Document;

	/**
	 * Specify a custom `Injector` instance to use for dependency injection.
	 */
	injector?: Injector;
}

export interface InjectWakeLockReturn {
	/**
	 * Whether Wake Lock is supported
	 */
	isSupported: Signal<boolean>;

	/**
	 * Whether the wake lock is currently active
	 */
	isActive: Signal<boolean>;

	/**
	 * The current wake lock sentinel object
	 */
	sentinel: Signal<WakeLockSentinel | null>;

	/**
	 * Request a wake lock. If the document is hidden, the request will be queued
	 * until the document becomes visible.
	 */
	request: (type: WakeLockType) => Promise<void>;

	/**
	 * Force request a wake lock immediately, even if the document is hidden.
	 * Note that this may throw an error if the document is hidden.
	 */
	forceRequest: (type: WakeLockType) => Promise<void>;

	/**
	 * Release the wake lock
	 */
	release: () => Promise<void>;
}

/**
 * Reactive Screen Wake Lock API.
 *
 * This function provides a reactive way to interact with the Screen Wake Lock API.
 * Provides a way to prevent devices from dimming or locking the screen when an
 * application needs to keep running.
 *
 * @example
 * ```ts
 * const { isSupported, isActive, request, release } = injectWakeLock();
 *
 * effect(() => {
 *   console.log('Wake lock active:', isActive());
 * });
 *
 * // Request wake lock
 * await request('screen');
 *
 * // Release wake lock
 * await release();
 * ```
 *
 * @example
 * With custom navigator and document:
 * ```ts
 * const wakeLock = injectWakeLock({
 *   navigator: window.navigator,
 *   document: window.document
 * });
 * ```
 *
 * @param options An optional object with the following properties:
 *   - `navigator`: (Optional) Specifies a custom `Navigator` instance. Useful for testing.
 *   - `document`: (Optional) Specifies a custom `Document` instance. This is useful when working with iframes or in testing environments.
 *   - `injector`: (Optional) Specifies a custom `Injector` instance for dependency injection.
 *
 * @returns An object with the following properties:
 *   - `isSupported`: A signal that emits `true` if the Wake Lock API is supported, otherwise `false`.
 *   - `isActive`: A signal that emits `true` if the wake lock is currently active and document is visible, otherwise `false`.
 *   - `sentinel`: A signal that emits the current wake lock sentinel object or `null`.
 *   - `request`: A function to request a wake lock. If the document is hidden, the request will be queued.
 *   - `forceRequest`: A function to force request a wake lock immediately, even if the document is hidden.
 *   - `release`: A function to release the wake lock.
 */
export function injectWakeLock(
	options: InjectWakeLockOptions = {},
): Readonly<InjectWakeLockReturn> {
	return assertInjector(injectWakeLock, options.injector, () => {
		const { navigator: customNavigator, document: customDocument } = options;

		const doc: Document = customDocument ?? inject(DOCUMENT);
		const nav: Navigator =
			customNavigator ??
			(inject(DOCUMENT) as any).defaultView?.navigator ??
			window.navigator;

		const requestedType = signal<WakeLockType | false>(false);
		const sentinel = signal<WakeLockSentinel | null>(null);
		const documentVisibility = injectDocumentVisibility({ document: doc });

		const isSupported = computed(() => nav && 'wakeLock' in nav);

		const isActive = computed(
			() => !!sentinel() && documentVisibility() === 'visible',
		);

		// Listen to sentinel 'release' events
		effect((onCleanup) => {
			const currentSentinel = sentinel();
			if (currentSentinel && isSupported()) {
				const subscription = fromEvent(currentSentinel, 'release').subscribe(
					() => {
						requestedType.set(currentSentinel?.type ?? false);
					},
				);

				onCleanup(() => subscription.unsubscribe());
			}
		});

		// Watch for document visibility changes and re-request wake lock if needed
		effect(() => {
			const isVisible = documentVisibility() === 'visible';
			const requested = requestedType();

			if (
				isVisible &&
				doc.visibilityState === 'visible' &&
				requested &&
				isSupported()
			) {
				untracked(() => {
					requestedType.set(false);
					void forceRequest(requested);
				});
			}
		});

		async function forceRequest(type: WakeLockType) {
			await sentinel()?.release();

			if (isSupported()) {
				try {
					const newSentinel = await (
						nav as NavigatorWithWakeLock
					).wakeLock.request(type);
					sentinel.set(newSentinel);
				} catch (error) {
					sentinel.set(null);
					throw error;
				}
			} else {
				sentinel.set(null);
			}
		}

		async function request(type: WakeLockType) {
			if (documentVisibility() === 'visible') {
				await forceRequest(type);
			} else {
				requestedType.set(type);
			}
		}

		async function release() {
			requestedType.set(false);
			const s = sentinel();
			sentinel.set(null);
			await s?.release();
		}

		return {
			isSupported,
			isActive,
			sentinel: sentinel.asReadonly(),
			request,
			forceRequest,
			release,
		};
	});
}
