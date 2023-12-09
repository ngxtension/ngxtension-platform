import { assertInInjectionContext, inject, type Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, type Params } from '@angular/router';
import { map } from 'rxjs';

/**
 * Injects the query params from the current route.
 */
export function injectQueryParams(): Signal<Params>;

/**
 * Injects the query params from the current route and returns the value of the provided key.
 * @param key
 */
export function injectQueryParams(key: string): Signal<string | null>;

/**
 * Injects the query params from the current route and returns the result of the provided transform function.
 * @param transform
 */
export function injectQueryParams<T>(
	transform: (params: Params) => T,
): Signal<T>;

/**
 * Injects the query params from the current route.
 * If a key is provided, it will return the value of that key.
 * If a transform function is provided, it will return the result of that function.
 * Otherwise, it will return the entire query params object.
 *
 * @example
 * const search = injectQueryParams('search'); // returns the value of the 'search' query param
 * const search = injectQueryParams(p => p['search'] as string); // same as above but can be used with a custom transform function
 * const queryParams = injectQueryParams(); // returns the entire query params object
 *
 * @param keyOrTransform OPTIONAL The key of the query param to return, or a transform function to apply to the query params object
 */
export function injectQueryParams<T>(
	keyOrTransform?: string | ((params: Params) => T),
): Signal<T | Params | string | null> {
	assertInInjectionContext(injectQueryParams);
	const route = inject(ActivatedRoute);
	const queryParams = route.snapshot.queryParams || {};

	if (typeof keyOrTransform === 'function') {
		return toSignal(route.queryParams.pipe(map(keyOrTransform)), {
			initialValue: keyOrTransform(queryParams),
		});
	}

	const getParam = (params: Params) =>
		keyOrTransform ? params?.[keyOrTransform] ?? null : params;

	return toSignal(route.queryParams.pipe(map(getParam)), {
		initialValue: getParam(queryParams),
	});
}
