import { inject, type Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, type Params } from '@angular/router';
import { map } from 'rxjs';

/**
 * Injects the params from the current route.
 */
export function injectParams(): Signal<Params>;

/**
 * Injects the params from the current route and returns the value of the provided key.
 * @param key
 */
export function injectParams(key: string): Signal<string | null>;

/**
 * Injects the params from the current route and returns the result of the provided transform function.
 * @param transform
 */
export function injectParams<T>(transform: (params: Params) => T): Signal<T>;

/**
 * Injects the params from the current route.
 * If a key is provided, it will return the value of that key.
 * If a transform function is provided, it will return the result of that function.
 * Otherwise, it will return the entire params object.
 *
 * @example
 * const userId = injectParams('id'); // returns the value of the 'id' param
 * const userId = injectParams(p => p['id'] as string); // same as above but can be used with a custom transform function
 * const params = injectParams(); // returns the entire params object
 *
 * @param keyOrTransform OPTIONAL The key of the param to return, or a transform function to apply to the params object
 */
export function injectParams<T>(
	keyOrTransform?: string | ((params: Params) => T)
): Signal<T | Params | string | null> {
	const route = inject(ActivatedRoute);
	const params = route.snapshot.params || {};

	if (typeof keyOrTransform === 'function') {
		return toSignal(route.params.pipe(map(keyOrTransform)), {
			initialValue: keyOrTransform(params),
		});
	}

	const getParam = (params: Params) =>
		keyOrTransform ? params?.[keyOrTransform] ?? null : params;

	return toSignal(route.params.pipe(map(getParam)), {
		initialValue: getParam(params),
	});
}
