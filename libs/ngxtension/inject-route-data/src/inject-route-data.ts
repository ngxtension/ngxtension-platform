import { inject, type Signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, type Data } from '@angular/router';
import { assertInjector } from 'ngxtension/assert-injector';
import { injectLeafActivatedRoute } from 'ngxtension/inject-leaf-activated-route';
import { DefaultValueOptions, InjectorOptions } from 'ngxtension/shared';
import { map, switchMap } from 'rxjs';

type RouteDataTransformFn<T> = (data: Data) => T;

/**
 * Merges all data from the route hierarchy by walking from root to the given route.
 * Child route data override parent route data if there are naming conflicts.
 */
function mergeRouteData(route: ActivatedRoute): Data {
	// Build path from root to current route
	const routePath: ActivatedRoute[] = [];
	let currentRoute: ActivatedRoute | null = route;

	while (currentRoute) {
		routePath.unshift(currentRoute);
		currentRoute = currentRoute.parent;
	}

	// Merge data from root to leaf (child data overrides parent data)
	const mergedData: Data = {};
	for (const r of routePath) {
		const data = r.snapshot?.data || {};
		Object.assign(mergedData, data);
	}

	return mergedData;
}

/**
 * The `RouteDataOptions` type defines options for configuring the behavior of the `injectRouteData` function.
 *
 * @template ReadT - The expected type of the read value.
 * @template WriteT - The type of the value to be written.
 * @template DefaultValueT - The type of the default value.
 */
export type RouteDataOptions<DefaultValueT> =
	DefaultValueOptions<DefaultValueT> & InjectorOptions;

/**
 * Core implementation shared between `injectRouteData` and `injectRouteData.global`.
 * Handles the logic for accessing route data based on key, transform function, or returning all data.
 */
function injectRouteDataCore<T>(
	dataObservable: import('rxjs').Observable<Data>,
	initialData: Data,
	keyOrTransform?: keyof Data | RouteDataTransformFn<T>,
	options: RouteDataOptions<T> = {},
): Signal<T | Data | null> {
	const { defaultValue } = options;

	if (!keyOrTransform) {
		return toSignal(dataObservable, { initialValue: initialData });
	}

	if (typeof keyOrTransform === 'function') {
		return toSignal(dataObservable.pipe(map(keyOrTransform)), {
			initialValue: keyOrTransform(initialData),
		});
	}

	const getDataParam = (data: Data) => {
		const param = data?.[keyOrTransform as keyof Data] as unknown | undefined;
		return param ?? defaultValue ?? null;
	};

	return toSignal(dataObservable.pipe(map(getDataParam)), {
		initialValue: getDataParam(initialData),
	});
}

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
		const route = inject(ActivatedRoute);
		return injectRouteDataCore(
			route.data,
			route.snapshot.data || {},
			keyOrTransform,
			options,
		);
	});
}

/**
 * Global variant of `injectRouteData` that retrieves route data from the leaf (deepest) `ActivatedRoute` in the router state tree.
 * This allows you to access route data from the entire route hierarchy, including child routes,
 * regardless of where your component is positioned in the component tree.
 *
 * @template T - The expected type of the read value.
 * @param keyOrTransform OPTIONAL The key of the route data to return, or a transform function to apply to the route data object
 * @param {RouteDataOptions} options - Optional configuration options for the route data.
 * @returns {Signal} A `Signal` that emits the transformed value of the specified route data, or the entire data object if no key is provided.
 *
 * @example
 * // Get all route data from route hierarchy
 * const data = injectRouteData.global();
 *
 * @example
 * // Get specific data from route hierarchy
 * const title = injectRouteData.global('title');
 *
 * @example
 * // Transform route data from route hierarchy
 * const breadcrumbs = injectRouteData.global((data) => data['breadcrumbs'] as string[]);
 *
 * @example
 * // With default value option
 * const title = injectRouteData.global('title', { defaultValue: 'Default Title' });
 */
injectRouteData.global = function <T>(
	keyOrTransform?: keyof Data | RouteDataTransformFn<T>,
	options: RouteDataOptions<T> = {},
): Signal<T | Data | null> {
	return assertInjector(injectRouteData.global, options?.injector, () => {
		const leafRoute = injectLeafActivatedRoute();
		const leafRoute$ = toObservable(leafRoute);

		const mergedData$ = leafRoute$.pipe(
			switchMap((route) => route.data),
			map(() => mergeRouteData(leafRoute())),
		);

		return injectRouteDataCore(
			mergedData$,
			mergeRouteData(leafRoute()),
			keyOrTransform,
			options,
		);
	});
};
