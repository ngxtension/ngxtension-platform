import { inject, type Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, type Params } from '@angular/router';
import { assertInjector } from 'ngxtension/assert-injector';
import {
	DefaultValueOptions,
	InjectorOptions,
	TransformOptions,
} from 'ngxtension/shared';
import { map } from 'rxjs';

type ParamsTransformFn<ReadT> = (params: Params) => ReadT;

/**
 * The `ParamsOptions` type defines options for configuring the behavior of the `injectParams` function.
 *
 * @template ReadT - The expected type of the read value.
 * @template WriteT - The type of the value to be written.
 * @template DefaultValueT - The type of the default value.
 */
export type ParamsOptions<ReadT, WriteT, DefaultValueT> = TransformOptions<
	ReadT,
	WriteT
> &
	DefaultValueOptions<DefaultValueT> &
	InjectorOptions;

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
 * @returns {Signal} A `Signal` that emits the transformed value based on the provided custom transform function.
 *
 * @example
 * const searchValue = injectParams((params) => params['search'] as string);
 */
export function injectParams<ReadT>(
	fn: ParamsTransformFn<ReadT>,
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
		const params = route.snapshot.params;
		const { transform, defaultValue } = options;

		if (!keyOrParamsTransform) {
			return toSignal(route.params, { initialValue: params });
		}

		if (typeof keyOrParamsTransform === 'function') {
			return toSignal(route.params.pipe(map(keyOrParamsTransform)), {
				initialValue: keyOrParamsTransform(params),
			});
		}

		const getParam = (params: Params) => {
			const param = params?.[keyOrParamsTransform] as string | undefined;

			if (!param) {
				return defaultValue ?? null;
			}

			return transform ? transform(param) : param;
		};

		return toSignal(route.params.pipe(map(getParam)), {
			initialValue: getParam(params),
		});
	});
}
