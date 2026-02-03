import { inject, type Signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, type Params } from '@angular/router';
import { assertInjector } from 'ngxtension/assert-injector';
import { injectLeafActivatedRoute } from 'ngxtension/inject-leaf-activated-route';
import {
	DefaultValueOptions,
	InjectorOptions,
	ParseOptions,
} from 'ngxtension/shared';
import { map, switchMap, type Observable } from 'rxjs';

type ParamsTransformFn<ReadT> = (params: Params) => ReadT;

/**
 * Merges all params from the route hierarchy by walking from root to the given route.
 * Child route params override parent route params if there are naming conflicts.
 */
function mergeRouteParams(route: ActivatedRoute): Params {
	// Build path from root to current route
	const routePath: ActivatedRoute[] = [];
	let currentRoute: ActivatedRoute | null = route;

	while (currentRoute) {
		routePath.unshift(currentRoute);
		currentRoute = currentRoute.parent;
	}

	// Merge params from root to leaf (child params override parent params)
	const mergedParams: Params = {};
	for (const r of routePath) {
		const params = r.snapshot?.params || {};
		Object.assign(mergedParams, params);
	}

	return mergedParams;
}

/**
 * The `ParamsOptions` type defines options for configuring the behavior of the `injectParams` function.
 *
 * @template ReadT - The expected type of the read value.
 * @template WriteT - The type of the value to be written.
 * @template DefaultValueT - The type of the default value.
 */
export type ParamsOptions<ReadT, WriteT, DefaultValueT> = ParseOptions<
	ReadT,
	WriteT
> &
	DefaultValueOptions<DefaultValueT> &
	InjectorOptions;

/**
 * Internal helper function that implements the core logic for injectParams.
 * This is shared between injectParams and injectParams.global.
 */
function injectParamsCore<T>(
	paramsObservable: Observable<Params>,
	initialParams: Params,
	keyOrParamsTransform?: string | ((params: Params) => T),
	options: ParamsOptions<T, string, T> = {},
): Signal<T | Params | string | null> {
	const { parse, defaultValue } = options;

	if (!keyOrParamsTransform) {
		return toSignal(paramsObservable, { initialValue: initialParams });
	}

	if (typeof keyOrParamsTransform === 'function') {
		return toSignal(paramsObservable.pipe(map(keyOrParamsTransform)), {
			initialValue: keyOrParamsTransform(initialParams),
		});
	}

	const getParam = (params: Params) => {
		const param = params?.[keyOrParamsTransform as string] as
			| string
			| undefined;

		if (!param) {
			return defaultValue ?? null;
		}

		return parse ? parse(param) : param;
	};

	return toSignal(paramsObservable.pipe(map(getParam)), {
		initialValue: getParam(initialParams),
	});
}

/**
 * The `injectParams` function allows you to access and manipulate parameters from the current route.
 *
 * @returns A `Signal` that emits the entire parameters object.
 */
export function injectParams(): Signal<Params>;

/**
 * The `injectParams` function allows you to access and manipulate parameters from the current route.
 *
 * @param {string} key - The name of the parameter to retrieve.
 * @returns {Signal} A `Signal` that emits the value of the specified parameter, or `null` if it's not present.
 */
export function injectParams(key: string): Signal<string | null>;

/**
 * The `injectParams` function allows you to access and manipulate parameters from the current route.
 *
 * @param {string} key - The name of the parameter to retrieve.
 * @param {ParamsOptions} options - Optional configuration options for the parameter.
 * @returns {Signal} A `Signal` that emits the transformed value of the specified parameter, or `null` if it's not present.
 */
export function injectParams<ReadT>(
	key?: string,
	options?: ParamsOptions<ReadT, string, ReadT>,
): Signal<ReadT | null>;

/**
 * The `injectParams` function allows you to access and manipulate parameters from the current route.
 * It retrieves the value of a parameter based on a custom transform function applied to the parameters object.
 *
 * @template ReadT - The expected type of the read value.
 * @param {ParamsTransformFn<ReadT>} fn - A transform function that takes the parameters object (`params: Params`) and returns the desired value.
 * @param options - Optional configuration options for the parameter.
 * @returns {Signal} A `Signal` that emits the transformed value based on the provided custom transform function.
 *
 * @example
 * const searchValue = injectParams((params) => params['search'] as string);
 */
export function injectParams<ReadT>(
	fn: ParamsTransformFn<ReadT>,
	options?: InjectorOptions,
): Signal<ReadT>;

/**
 * Injects the params from the current route.
 * If a key is provided, it will return the value of that key.
 * If a transform function is provided, it will return the result of that function.
 * Otherwise, it will return the entire params object.
 *
 * @template T - The expected type of the read value.
 * @param keyOrParamsTransform OPTIONAL The key of the param to return, or a transform function to apply to the params object
 * @param {ParamsOptions} options - Optional configuration options for the parameter.
 * @returns {Signal} A `Signal` that emits the transformed value of the specified parameter, or the entire parameters object if no key is provided.
 *
 * @example
 * const userId = injectParams('id'); // returns the value of the 'id' param
 * const userId = injectParams(p => p['id'] as string); // same as above but can be used with a custom transform function
 * const params = injectParams(); // returns the entire params object
 *
 */
export function injectParams<T>(
	keyOrParamsTransform?: string | ((params: Params) => T),
	options: ParamsOptions<T, string, T> = {},
): Signal<T | Params | string | null> {
	return assertInjector(injectParams, options?.injector, () => {
		const route = inject(ActivatedRoute);
		return injectParamsCore(
			route.params,
			route.snapshot.params,
			keyOrParamsTransform,
			options,
		);
	});
}

/**
 * Global variant of `injectParams` that retrieves params from the leaf (deepest) `ActivatedRoute` in the router state tree.
 * This allows you to access all route parameters from the entire route hierarchy, including child routes,
 * regardless of where your component is positioned in the component tree.
 *
 * @template T - The expected type of the read value.
 * @param keyOrParamsTransform OPTIONAL The key of the param to return, or a transform function to apply to the params object
 * @param {ParamsOptions} options - Optional configuration options for the parameter.
 * @returns {Signal} A `Signal` that emits the transformed value of the specified parameter, or the entire parameters object if no key is provided.
 *
 * @example
 * // Get all params from route hierarchy
 * const params = injectParams.global();
 *
 * @example
 * // Get specific param from route hierarchy
 * const childId = injectParams.global('childId');
 *
 * @example
 * // Transform params from route hierarchy
 * const allKeys = injectParams.global((params) => Object.keys(params));
 *
 * @example
 * // With parse option
 * const productId = injectParams.global('productId', { parse: numberAttribute });
 */
injectParams.global = function <T>(
	keyOrParamsTransform?: string | ((params: Params) => T),
	options: ParamsOptions<T, string, T> = {},
): Signal<T | Params | string | null> {
	return assertInjector(injectParams.global, options?.injector, () => {
		// Use the leaf route reactively and merge all params from the hierarchy
		const leafRoute = injectLeafActivatedRoute();
		const leafRoute$ = toObservable(leafRoute);

		// Create an observable that emits merged params from the route hierarchy
		const mergedParams$ = leafRoute$.pipe(
			switchMap((route) => route.params),
			map(() => mergeRouteParams(leafRoute())),
		);

		return injectParamsCore(
			mergedParams$,
			mergeRouteParams(leafRoute()),
			keyOrParamsTransform,
			options,
		);
	});
};
