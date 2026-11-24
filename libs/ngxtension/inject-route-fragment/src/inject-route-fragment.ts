import { inject, type Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { assertInjector } from 'ngxtension/assert-injector';
import {
	DefaultValueOptions,
	InjectorOptions,
	ParseOptions,
} from 'ngxtension/shared';
import { map } from 'rxjs';

/**
 * The `InjectRouteFragmentOptions` type defines options for configuring the behavior of the `injectRouteFragment` function.
 *
 * @template T - The expected type of the read value.
 */
export type InjectRouteFragmentOptions<T = unknown> = ParseOptions<
	T,
	string | null
> &
	InjectorOptions &
	DefaultValueOptions<T> & {
		/**
		 * A transformation function to convert the written value to the expected read value.
		 *
		 * @deprecated Use `parse` as a replacement.
		 * @param v - The value to transform.
		 * @returns The transformed value.
		 */
		transform?: (v: string | null) => T;
	};

/**
 * The `injectRouteFragment` function allows you to access and transform url fragment from the current route.
 *
 * @returns {Signal} A `Signal` that emits the route fragment.
 */
export function injectRouteFragment(): Signal<string | null>;

/**
 * The `injectRouteFragment` function allows you to access and transform url fragment from the current route.
 * The `parse` function is called for every fragment, `null` included, unless a `defaultValue` replaces `null`.
 *
 * @param {InjectRouteFragmentOptions} options - inject options with a `parse` fn and an optional `defaultValue`.
 * @returns {Signal} A `Signal` that emits the parsed value of url fragment.
 */
export function injectRouteFragment<T>(
	options: InjectRouteFragmentOptions<T> &
		Required<ParseOptions<T, string | null>>,
): Signal<T>;

/**
 * The `injectRouteFragment` function allows you to access and transform url fragment from the current route.
 *
 * @deprecated Use the `parse` option instead of `transform`.
 * @param {InjectRouteFragmentOptions} options - inject options with a `transform` fn.
 * @returns {Signal} A `Signal` that emits the transformed value of url fragment.
 */
export function injectRouteFragment<T>(
	options: InjectRouteFragmentOptions<T> & {
		transform: (v: string | null) => T;
	},
): Signal<T>;

/**
 * The `injectRouteFragment` function allows you to access url fragment from the current route.
 * Without `parse`, the fragment string is returned as-is and `defaultValue` is used only when there is no fragment.
 *
 * @param {InjectRouteFragmentOptions} options - inject options with a `defaultValue`.
 * @returns {Signal} A `Signal` that emits the url fragment, or `defaultValue` when there is none.
 */
export function injectRouteFragment<T>(
	options: InjectorOptions & { defaultValue: T },
): Signal<string | T>;

/**
 * The `injectRouteFragment` function allows you to access url fragment from the current route.
 *
 * @param {InjectorOptions} options - inject options like a custom injector.
 * @returns {Signal} A `Signal` that emits the url fragment, or `null` when there is none.
 */
export function injectRouteFragment(
	options: InjectorOptions & {
		parse?: undefined;
		transform?: undefined;
		defaultValue?: undefined;
	},
): Signal<string | null>;

/**
 * The `injectRouteFragment` function allows you to access and transform url fragment from the current route.
 *
 * @param {InjectRouteFragmentOptions} options - inject options like parse fn and default value.
 * @returns {Signal} A `Signal` that emits the url fragment, its parsed value or the default value.
 */
export function injectRouteFragment<T>(
	options: InjectRouteFragmentOptions<T>,
): Signal<T | string | null>;

export function injectRouteFragment<T>(
	options?: InjectRouteFragmentOptions<T>,
) {
	return assertInjector(injectRouteFragment, options?.injector, () => {
		const route = inject(ActivatedRoute);
		const initialRouteFragment = route.snapshot.fragment;
		const getFragment = (fragment: string | null) => {
			if (fragment === null && options?.defaultValue !== undefined) {
				return options.defaultValue;
			}
			if (options?.parse) {
				return options.parse(fragment);
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
