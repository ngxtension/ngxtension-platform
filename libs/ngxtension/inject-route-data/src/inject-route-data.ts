import { inject, type Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, type Data } from '@angular/router';
import { injectLeafActivatedRoute } from 'libs/ngxtension/inject-leaf-activated-route/src/inject-leaf-activated-route';
import { assertInjector } from 'ngxtension/assert-injector';
import { DefaultValueOptions, InjectorOptions } from 'ngxtension/shared';
import { map } from 'rxjs';

type RouteDataTransformFn<T> = (data: Data) => T;

export type RouteDataFromNavigationEndOptions = {
	/**
	 * Retrieve data from the leaf `ActivatedRoute` of the latest `NavigationEnd` event.
	 * Essentially, this resolve to all route data, instead of only the route data of the current route level.
	 */
	fromNavigationEnd?: boolean;
};

/**
 * The `RouteDataOptions` type defines options for configuring the behavior of the `injectRouteData` function.
 *
 * @template ReadT - The expected type of the read value.
 * @template WriteT - The type of the value to be written.
 * @template DefaultValueT - The type of the default value.
 */
export type RouteDataOptions<DefaultValueT> =
	DefaultValueOptions<DefaultValueT> &
		RouteDataFromNavigationEndOptions &
		InjectorOptions;

/**
 * The `injectRouteData` function allows you to access and manipulate route data from the current route.
 *
 * @returns A `Signal` that emits the entire data object.
 */
export function injectRouteData(): Signal<Data>;

/**
 * The `injectRouteData` function allows you to access and manipulate route data from the current route.
 *
 * @template T - The expected type of the read value.
 * @param {string} key - The name of the route data to retrieve.
 * @param {RouteDataOptions} options - Optional configuration options for the route data.
 * @returns {Signal} A `Signal` that emits the value of the specified route data, or `null` if it's not present.
 */
export function injectRouteData<T>(
	key: keyof Data,
	options?: RouteDataOptions<T>,
): Signal<T | null>;

/**
 * The `injectRouteData` function allows you to access and manipulate route data from the current route.
 * It retrieves the value of the route data based on a custom transform function applied to the route data object.
 *
 * @template T - The expected type of the read value.
 * @param {RouteDataTransformFn<T>} fn - A transform function that takes the route data object and returns the desired value.
 * @param {RouteDataOptions} options - Optional configuration options for the route data.
 * @returns {Signal<T>} A `Signal` that emits the transformed value based on the provided custom transform function.
 *
 * @example
 * const searchValue = injectRouteData((data) => data['search'] as string);
 */
export function injectRouteData<ReadT>(
	fn: RouteDataTransformFn<ReadT>,
	options?: RouteDataOptions<ReadT>,
): Signal<ReadT>;

export function injectRouteData<T>(
	keyOrTransform?: keyof Data | RouteDataTransformFn<T>,
	options: RouteDataOptions<T> = {},
) {
	return assertInjector(injectRouteData, options?.injector, () => {
		const route = options.fromNavigationEnd
			? injectLeafActivatedRoute()()
			: inject(ActivatedRoute);

		const initialRouteData = route.snapshot.data || {};
		const { defaultValue } = options;

		if (!keyOrTransform) {
			return toSignal(route.data, { initialValue: initialRouteData });
		}

		if (typeof keyOrTransform === 'function') {
			return toSignal(route.data.pipe(map(keyOrTransform)), {
				initialValue: keyOrTransform(initialRouteData),
			});
		}

		const getDataParam = (data: Data) => {
			const param = data?.[keyOrTransform] as unknown | undefined;

			return param ?? defaultValue ?? null;
		};

		return toSignal(route.data.pipe(map(getDataParam)), {
			initialValue: getDataParam(initialRouteData),
		});
	});
}
