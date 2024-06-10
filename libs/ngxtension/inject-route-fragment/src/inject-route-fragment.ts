import { inject, type Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { assertInjector } from 'ngxtension/assert-injector';
import {
	DefaultValueOptions,
	InjectorOptions,
	TransformOptions,
} from 'ngxtension/shared';
import { map } from 'rxjs';

/**
 * The `InjectRouteFragmentOptions` type defines options for configuring the behavior of the `injectRouteFragment` function.
 *
 * @template T - The expected type of the read value.
 */
export type InjectRouteFragmentOptions<T = unknown> = TransformOptions<
	T,
	string | null
> &
	InjectorOptions &
	DefaultValueOptions<T>;

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
			if (fragment === null && options?.defaultValue) {
				return options.defaultValue;
			}
			if (options?.transform) {
				return options.transform(fragment);
			}

			return fragment;
		};
		const fragment$ = route.fragment.pipe(map(getFragment));

		return toSignal(fragment$, {
			initialValue: getFragment(initialRouteFragment),
		});
	});
}
