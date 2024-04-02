import { assertInInjectionContext, inject, type Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, type Data } from '@angular/router';
import { map } from 'rxjs';

type RouteDataTransformFn<T> = (data: Data) => T;

/**
 * The `injectRouteData` function allows you to access and manipulate data from the current route.
 *
 * @returns {Signal} A `Signal` that emits the entire route data object.
 */
export function injectRouteData(): Signal<Data>;

/**
 * The `injectRouteData` function allows you to access and manipulate data from the current route.
 * @param {string} key - The name of the route data object key to retrieve.
 * @returns {Signal} A `Signal` that emits the value of the specified route data object key
 */
export function injectRouteData<T>(key: keyof Data): Signal<T | null>;

/**
 * The `injectQueryParams` function allows you to access and manipulate query parameters from the current route.
 *
 * @param {RouteDataTransformFn} transform - The name of the query parameter to retrieve.
 * @returns {Signal} A `Signal` that emits the transformed value of the specified route data object key.
 */
export function injectRouteData<T>(
	transform: RouteDataTransformFn<T>,
): Signal<T>;

export function injectRouteData<T>(
	keyOrTransform?: keyof Data | ((data: Data) => T),
) {
	assertInInjectionContext(injectRouteData);
	const route = inject(ActivatedRoute);
	const initialRouteData = route.snapshot.data || {};

	const getDataParam =
		typeof keyOrTransform === 'function'
			? keyOrTransform
			: (data: Data) =>
					keyOrTransform ? data?.[keyOrTransform] ?? null : data;

	return toSignal(route.data.pipe(map(getDataParam)), {
		initialValue: getDataParam(initialRouteData),
	});
}
