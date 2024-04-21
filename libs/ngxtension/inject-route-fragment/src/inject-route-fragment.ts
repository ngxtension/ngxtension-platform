import { inject, type Injector, type Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { assertInjector } from 'ngxtension/assert-injector';
import { map } from 'rxjs';

export interface InjectRouteFragmentOptions<T = unknown> {
	/**
	 * A transformation function.
	 *
	 * @param fragment - The fragment value to transform.
	 * @returns The transformed value.
	 */
	transform?: (fragment: string | null) => T;

	/**
	 * The optional "custom" Injector. If this is not provided, will be retrieved from the current injection context
	 */
	injector?: Injector;
}

/**
 * The `injectRouteFragment` function allows you to access and transform url fragment from the current route.
 *
 * @returns {Signal} A `Signal` that emits the route fragment.
 */
export function injectRouteFragment(): Signal<string | null>;

/**
 * The `injectRouteFragment` function allows you to access and transform url fragment from the current route.
 *
 * @param {InjectRouteFragmentOptions} options - inject options like transform fn.
 * @returns {Signal} A `Signal` that emits the transformed value of url fragment.
 */
export function injectRouteFragment<T>(
	options: InjectRouteFragmentOptions<T>,
): Signal<T>;

export function injectRouteFragment<T>(
	options?: InjectRouteFragmentOptions<T>,
) {
	return assertInjector(injectRouteFragment, options?.injector, () => {
		const route = inject(ActivatedRoute);
		const initialRouteFragment = route.snapshot.fragment;
		const getFragment = (fragment: string | null) => {
			if (options?.transform) return options.transform(fragment);
			return fragment;
		};
		const fragment$ = route.fragment.pipe(map(getFragment));

		return toSignal(fragment$, {
			initialValue: getFragment(initialRouteFragment),
		});
	});
}
