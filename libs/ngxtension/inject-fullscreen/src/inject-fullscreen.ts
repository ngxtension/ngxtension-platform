import { DOCUMENT } from '@angular/common';
import {
	type Injector,
	type Signal,
	computed,
	effect,
	inject,
	signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { assertInjector } from 'ngxtension/assert-injector';
import { fromEvent, merge } from 'rxjs';

// Ported from https://vueuse.org/core/useFullscreen/

export interface InjectFullscreenOptions {
	/**
	 * The target element to make fullscreen. If not provided, the document element will be used.
	 */
	target?: HTMLElement;

	/**
	 * Automatically exit fullscreen when component is unmounted
	 *
	 * @default false
	 */
	autoExit?: boolean;

	/**
	 * Specify a custom `Document` instance, e.g. working with iframes or in testing environments.
	 */
	document?: Document;

	/**
	 * Specify a custom `Injector` instance to use for dependency injection.
	 */
	injector?: Injector;
}

export interface InjectFullscreenReturn {
	/**
	 * Whether fullscreen is supported
	 */
	isSupported: Signal<boolean>;

	/**
	 * Whether the element is currently in fullscreen mode
	 */
	isFullscreen: Signal<boolean>;

	/**
	 * Enter fullscreen mode
	 */
	enter: () => Promise<void>;

	/**
	 * Exit fullscreen mode
	 */
	exit: () => Promise<void>;

	/**
	 * Toggle fullscreen mode
	 */
	toggle: () => Promise<void>;
}

const eventHandlers = [
	'fullscreenchange',
	'webkitfullscreenchange',
	'webkitendfullscreen',
	'mozfullscreenchange',
	'MSFullscreenChange',
] as const;

/**
 * Reactive Fullscreen API.
 *
 * This function provides a reactive way to interact with the Fullscreen API. It adds methods to present a specific Element (and its descendants) in full-screen mode, and to exit full-screen mode once it is no longer needed.
 *
 * @example
 * ```ts
 * const { isFullscreen, enter, exit, toggle, isSupported } = injectFullscreen();
 *
 * effect(() => {
 *   console.log('Is fullscreen:', isFullscreen());
 * });
 *
 * // Enter fullscreen
 * await enter();
 *
 * // Exit fullscreen
 * await exit();
 *
 * // Toggle fullscreen
 * await toggle();
 * ```
 *
 * @example
 * With a specific element:
 * ```ts
 * @Component({
 *   template: `
 *     <video #videoEl>...</video>
 *     <button (click)="toggle()">Toggle Fullscreen</button>
 *   `
 * })
 * class MyComponent {
 *   videoEl = viewChild<ElementRef<HTMLVideoElement>>('videoEl');
 *   fullscreen = injectFullscreen({
 *     target: computed(() => this.videoEl()?.nativeElement)
 *   });
 *
 *   toggle = this.fullscreen.toggle;
 * }
 * ```
 *
 * @param options An optional object with the following properties:
 *   - `target`: (Optional) The target element to make fullscreen. If not provided, the document element will be used.
 *   - `autoExit`: (Optional) Automatically exit fullscreen when component is unmounted. Default is `false`.
 *   - `document`: (Optional) Specifies a custom `Document` instance. This is useful when working with iframes or in testing environments.
 *   - `injector`: (Optional) Specifies a custom `Injector` instance for dependency injection.
 *
 * @returns An object with the following properties:
 *   - `isSupported`: A signal that emits `true` if the Fullscreen API is supported, otherwise `false`.
 *   - `isFullscreen`: A signal that emits `true` if the element is currently in fullscreen mode, otherwise `false`.
 *   - `enter`: A function to enter fullscreen mode.
 *   - `exit`: A function to exit fullscreen mode.
 *   - `toggle`: A function to toggle fullscreen mode.
 */
export function injectFullscreen(
	options: InjectFullscreenOptions = {},
): Readonly<InjectFullscreenReturn> {
	return assertInjector(injectFullscreen, options.injector, () => {
		const { target, autoExit = false, document: customDocument } = options;

		const doc: Document = customDocument ?? inject(DOCUMENT);
		const targetElement = computed(() => target ?? doc.documentElement);
		const isFullscreen = signal(false);

		// Find the appropriate fullscreen request method with vendor prefixes
		const requestMethod = computed<string | undefined>(() => {
			const methods = [
				'requestFullscreen',
				'webkitRequestFullscreen',
				'webkitEnterFullscreen',
				'webkitEnterFullScreen',
				'webkitRequestFullScreen',
				'mozRequestFullScreen',
				'msRequestFullscreen',
			];

			return methods.find(
				(m) =>
					(doc && m in doc) ||
					(targetElement() && m in (targetElement() as any)),
			);
		});

		// Find the appropriate fullscreen exit method with vendor prefixes
		const exitMethod = computed<string | undefined>(() => {
			const methods = [
				'exitFullscreen',
				'webkitExitFullscreen',
				'webkitExitFullScreen',
				'webkitCancelFullScreen',
				'mozCancelFullScreen',
				'msExitFullscreen',
			];

			return methods.find(
				(m) =>
					(doc && m in doc) ||
					(targetElement() && m in (targetElement() as any)),
			);
		});

		// Find the appropriate fullscreen enabled property with vendor prefixes
		const fullscreenEnabled = computed<string | undefined>(() => {
			const properties = [
				'fullScreen',
				'webkitIsFullScreen',
				'webkitDisplayingFullscreen',
				'mozFullScreen',
				'msFullscreenElement',
			];

			return properties.find(
				(m) =>
					(doc && m in doc) ||
					(targetElement() && m in (targetElement() as any)),
			);
		});

		// Find the appropriate fullscreen element property
		const fullscreenElementMethod = (() => {
			const properties = [
				'fullscreenElement',
				'webkitFullscreenElement',
				'mozFullScreenElement',
				'msFullscreenElement',
			];

			return properties.find((m) => doc && m in doc);
		})();

		const isSupported = computed(
			() =>
				!!targetElement() &&
				!!doc &&
				requestMethod() !== undefined &&
				exitMethod() !== undefined &&
				fullscreenEnabled() !== undefined,
		);

		const isCurrentElementFullScreen = (): boolean => {
			if (fullscreenElementMethod) {
				return (doc as any)[fullscreenElementMethod] === targetElement();
			}
			return false;
		};

		const isElementFullScreen = (): boolean => {
			const enabledProp = fullscreenEnabled();
			if (enabledProp) {
				if (doc && (doc as any)[enabledProp] != null) {
					return (doc as any)[enabledProp];
				} else {
					const target = targetElement();
					if (target && (target as any)[enabledProp] != null) {
						return Boolean((target as any)[enabledProp]);
					}
				}
			}
			return false;
		};

		async function exit() {
			if (!isSupported() || !isFullscreen()) return;

			const method = exitMethod();
			if (method) {
				if (doc && (doc as any)[method] != null) {
					await (doc as any)[method]();
				} else {
					const target = targetElement();
					if (target && (target as any)[method] != null) {
						await (target as any)[method]();
					}
				}
			}

			isFullscreen.set(false);
		}

		async function enter() {
			if (!isSupported() || isFullscreen()) return;

			if (isElementFullScreen()) {
				await exit();
			}

			const target = targetElement();
			const method = requestMethod();
			if (method && target && (target as any)[method] != null) {
				await (target as any)[method]();
				isFullscreen.set(true);
			}
		}

		async function toggle() {
			await (isFullscreen() ? exit() : enter());
		}

		const handlerCallback = () => {
			const isElementFullScreenValue = isElementFullScreen();
			if (
				!isElementFullScreenValue ||
				(isElementFullScreenValue && isCurrentElementFullScreen())
			) {
				isFullscreen.set(isElementFullScreenValue);
			}
		};

		// Listen to fullscreen change events
		const listenerOptions = { capture: false, passive: true };

		// Create observables for document events
		const documentEvents = eventHandlers.map((event) =>
			fromEvent(doc, event, listenerOptions),
		);

		// Subscribe to all document events
		merge(...documentEvents)
			.pipe(takeUntilDestroyed())
			.subscribe(() => handlerCallback());

		// Subscribe to target element events if different from document
		effect((onCleanup) => {
			const target = targetElement();
			if (target && target !== doc.documentElement) {
				const targetEvents = eventHandlers.map((event) =>
					fromEvent(target, event, listenerOptions),
				);

				const subscription = merge(...targetEvents).subscribe(() =>
					handlerCallback(),
				);

				onCleanup(() => subscription.unsubscribe());
			}
		});

		// Initialize fullscreen state
		effect(() => {
			handlerCallback();
		});

		// Auto exit on destroy if enabled
		if (autoExit) {
			effect((onCleanup) => {
				onCleanup(() => {
					void exit();
				});
			});
		}

		return {
			isSupported,
			isFullscreen: isFullscreen.asReadonly(),
			enter,
			exit,
			toggle,
		};
	});
}
