import {
	runInInjectionContext,
	signal,
	type Injector,
	type Signal,
} from '@angular/core';
import { assertInjector } from 'ngxtension/assert-injector';
import { injectRafFn } from 'ngxtension/inject-raf-fn';

export interface InjectFpsOptions {
	/**
	 * Calculate the FPS on every x frames.
	 * @default 10
	 */
	every?: number;

	/**
	 * The injector to use.
	 */
	injector?: Injector;
}

export function injectFps(options?: InjectFpsOptions): Signal<number> {
	const injector = assertInjector(injectFps, options?.injector);

	return runInInjectionContext(injector, () => {
		const fps = signal(0);
		if (typeof performance === 'undefined') return fps.asReadonly();

		const every = options?.every ?? 10;

		let last = performance.now();
		let ticks = 0;

		injectRafFn(
			() => {
				ticks += 1;
				if (ticks >= every) {
					const now = performance.now();
					const diff = now - last;
					fps.set(Math.round(1000 / (diff / ticks)));
					last = now;
					ticks = 0;
				}
			},
			{ injector }
		);

		return fps;
	});
}
