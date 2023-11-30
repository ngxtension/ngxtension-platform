import { isPlatformServer } from '@angular/common';
import {
	NgZone,
	PLATFORM_ID,
	inject,
	runInInjectionContext,
	signal,
	type Injector,
	type Signal,
} from '@angular/core';
import { assertInjector } from 'ngxtension/assert-injector';

export interface InjectRafFnCallbackArguments {
	/**
	 * Time elapsed between this and the last frame.
	 */
	delta: number;

	/**
	 * Time elapsed since the creation of the web page. See {@link https://developer.mozilla.org/en-US/docs/Web/API/DOMHighResTimeStamp#the_time_origin Time origin}.
	 */
	timestamp: DOMHighResTimeStamp;
}

export interface UseRafFnOptions {
	/**
	 * Start the requestAnimationFrame loop immediately on creation
	 *
	 * @default true
	 */
	immediate?: boolean;
	/**
	 * The maximum frame per second to execute the function.
	 * Set to `undefined` to disable the limit.
	 *
	 * @default undefined
	 */
	fpsLimit?: number;

	/**
	 * The injector to use.
	 */
	injector?: Injector;
}

export interface RafFn {
	/**
	 * A signal to indicate whether an instance is active
	 */
	isActive: Signal<boolean>;

	/**
	 * Temporary pause the effect from executing
	 */
	pause: () => void;

	/**
	 * Resume the effects
	 */
	resume: () => void;
}

/**
 * Call function on every `requestAnimationFrame`. With controls of pausing and resuming.
 *
 * @param fn
 * @param options
 */
export function injectRafFn(
	fn: (args: InjectRafFnCallbackArguments) => void,
	options: UseRafFnOptions = {}
): RafFn {
	const injector = assertInjector(injectRafFn, options?.injector);

	return runInInjectionContext(injector, () => {
		const ngZone = inject(NgZone);
		const isServer = isPlatformServer(inject(PLATFORM_ID));

		if (isServer) {
			return {
				isActive: signal(false).asReadonly(),
				pause: () => {},
				resume: () => {},
			};
		}

		const { immediate = true, fpsLimit = undefined } = options;

		const isActive = signal(false);

		const intervalLimit = fpsLimit ? 1000 / fpsLimit : null;
		let previousFrameTimestamp = 0;
		let rafId: null | number = null;

		const loop = (timestamp: DOMHighResTimeStamp) => {
			if (!isActive() || !window) return;

			const delta = timestamp - (previousFrameTimestamp || timestamp);

			if (intervalLimit && delta < intervalLimit) {
				rafId = ngZone.runOutsideAngular(() =>
					window.requestAnimationFrame(loop)
				);
				return;
			}

			fn({ delta, timestamp });

			previousFrameTimestamp = timestamp;

			rafId = ngZone.runOutsideAngular(() =>
				window.requestAnimationFrame(loop)
			);
		};

		const resume = () => {
			if (!isActive() && window) {
				isActive.set(true);
				rafId = ngZone.runOutsideAngular(() =>
					window.requestAnimationFrame(loop)
				);
			}
		};

		const pause = () => {
			isActive.set(false);
			if (rafId && typeof rafId === 'number' && window) {
				ngZone.runOutsideAngular(() => window.cancelAnimationFrame(rafId!));
				rafId = null;
			}
		};

		if (immediate) resume();

		return {
			isActive: isActive.asReadonly(),
			pause,
			resume,
		};
	});
}
