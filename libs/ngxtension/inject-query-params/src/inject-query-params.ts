import { inject, type Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, type Params } from '@angular/router';
import { assertInjector } from 'ngxtension/assert-injector';
import {
	DefaultValueOptions,
	InjectorOptions,
	ParseOptions,
} from 'ngxtension/shared';
import { map } from 'rxjs';

type QueryParamsTransformFn<ReadT> = (params: Params) => ReadT;

/**
 * The `QueryParamsOptions` type defines options for configuring the behavior of the `injectQueryParams` function.
 *
 * @template ReadT - The expected type of the read value.
 * @template WriteT - The type of the value to be written.
 * @template DefaultValueT - The type of the default value.
 */
export type QueryParamsOptions<ReadT, DefaultValueT> = ParseOptions<
	ReadT,
	string | null
> &
	DefaultValueOptions<DefaultValueT> &
	InjectorOptions & {
		/**
		 * The initial value to use if the query parameter is not present or undefined.
		 *
		 * @deprecated Use `defaultValue` as a replacement.
		 */
		initialValue?: DefaultValueT;
		/**
		 * A transformation function to convert the written value to the expected read value.
		 *
		 * @deprecated Use `parse` as a replacement.
		 * @param v - The value to transform.
		 * @returns The transformed value.
		 */
		transform?: (v: string | null) => ReadT;
	};

/**
 * The `injectQueryParams` function allows you to access and manipulate query parameters from the current route.
 *
 * @returns A `Signal` that emits the entire query parameters object.
 */
export function injectQueryParams(): Signal<Params>;

/**
 * The `injectQueryParams` function allows you to access and manipulate query parameters from the current route.
 *
 * @param {string} key - The name of the query parameter to retrieve.
 * @returns {Signal} A `Signal` that emits the value of the specified query parameter, or `null` if it's not present.
 */
export function injectQueryParams(key: string): Signal<string | null>;

/**
 * The `injectQueryParams` function allows you to access and manipulate query parameters from the current route.
 *
 * @param {string} key - The name of the query parameter to retrieve.
 * @param {QueryParamsOptions} options - Optional configuration options for the query parameter.
 * @returns {Signal} A `Signal` that emits the transformed value of the specified query parameter, or `null` if it's not present.
 */
export function injectQueryParams<ReadT>(
	key?: string,
	options?: QueryParamsOptions<ReadT, ReadT>,
): Signal<ReadT | null>;

/**
 * The `injectQueryParams` function allows you to access and manipulate query parameters from the current route.
 * It retrieves the value of a query parameter based on a custom transform function applied to the query parameters object.
 *
 * @template ReadT - The expected type of the read value.
 * @param {QueryParamsTransformFn<ReadT>} fn - A transform function that takes the query parameters object (`params: Params`) and returns the desired value.
 * @returns {Signal} A `Signal` that emits the transformed value based on the provided custom transform function.
 *
 * @example
 * const searchValue = injectQueryParams((params) => params['search'] as string);
 */
export function injectQueryParams<ReadT>(
	fn: QueryParamsTransformFn<ReadT>,
): Signal<ReadT>;

/**
 * The `injectQueryParams` function allows you to access and manipulate query parameters from the current route.
 *
 * @template ReadT - The expected type of the read value.
 * @param {string} keyOrParamsTransform - The name of the query parameter to retrieve, or a parse function to apply to the query parameters object.
 * @param {QueryParamsOptions} options - Optional configuration options for the query parameter.
 * @returns {Signal} A `Signal` that emits the parsed value of the specified query parameter, or the entire query parameters object if no key is provided.
 *
 * @example
 * const search = injectQueryParams('search'); // returns the value of the 'search' query param
 * const search = injectQueryParams(p => p['search'] as string); // same as above but can be used with a custom parse function
 * const idParam = injectQueryParams('id', {parse: numberAttribute}); // returns the value fo the 'id' query params and parses it into a number
 * const idParam = injectQueryParams(p => numberAttribute(p['id'])); // same as above but can be used with a custom transform function
 * const queryParams = injectQueryParams(); // returns the entire query params object
 */
export function injectQueryParams<ReadT>(
	keyOrParamsTransform?: string | ((params: Params) => ReadT),
	options: QueryParamsOptions<ReadT, ReadT> = {},
): Signal<ReadT | Params | string | boolean | number | null> {
	return assertInjector(injectQueryParams, options?.injector, () => {
		const route = inject(ActivatedRoute);
		const queryParams = route.snapshot.queryParams || {};

		const { parse, transform, initialValue, defaultValue } = options;

		if (!keyOrParamsTransform) {
			return toSignal(route.queryParams, { initialValue: queryParams });
		}

		if (typeof keyOrParamsTransform === 'function') {
			return toSignal(route.queryParams.pipe(map(keyOrParamsTransform)), {
				initialValue: keyOrParamsTransform(queryParams),
			});
		}

		const getParam = (params: Params) => {
			const param = params?.[keyOrParamsTransform] as
				| string
				| string[]
				| undefined;

			if (!param) {
				return defaultValue ?? initialValue ?? null;
			}

			if (Array.isArray(param)) {
				if (param.length < 1) {
					return defaultValue ?? initialValue ?? null;
				}
				return parse
					? parse(param[0])
					: transform
						? transform(param[0])
						: param[0];
			}

			return parse ? parse(param) : transform ? transform(param) : param;
		};

		return toSignal(route.queryParams.pipe(map(getParam)), {
			initialValue: getParam(queryParams),
		});
	});
}

/**
 * The `injectQueryParams` function namespace provides additional functionality for handling array query parameters.
 */
export namespace injectQueryParams {
	/**
	 * Retrieve an array query parameter with optional configuration options.
	 *
	 * @param {string} key - The name of the array query parameter to retrieve.
	 * @param {QueryParamsOptions} options - Optional configuration options for the array query parameter.
	 * @returns {Signal} A `Signal` that emits an array of values for the specified query parameter, or `null` if it's not present.
	 */
	export function array(
		key: string,
		options?: QueryParamsOptions<string, string[]>,
	): Signal<string[] | null>;

	/**
	 * Retrieve an array query parameter with optional configuration options.
	 *
	 * @param {string} key - The name of the array query parameter to retrieve.
	 * @param {QueryParamsOptions} options - Optional configuration options for the array query parameter.
	 * @returns {Signal} A `Signal` that emits an array of values for the specified query parameter, or `null` if it's not present.
	 */
	export function array<ReadT>(
		key: string,
		options?: QueryParamsOptions<ReadT, ReadT[]>,
	): Signal<ReadT[] | null>;

	/**
	 * Retrieve an array query parameter with optional configuration options.
	 *
	 * @template ReadT - The expected type of the read value.
	 * @param {string} key - The name of the array query parameter to retrieve.
	 * @param {QueryParamsOptions} options - Optional configuration options for the array query parameter.
	 * @returns {Signal} A `Signal` that emits an array of transformed values for the specified query parameter, or `null` if it's not present.
	 */
	export function array<ReadT>(
		key: string,
		options: QueryParamsOptions<ReadT, ReadT[]> = {},
	): Signal<(ReadT | string)[] | null> {
		return assertInjector(injectQueryParams.array, options?.injector, () => {
			const route = inject(ActivatedRoute);
			const queryParams = route.snapshot.queryParams || {};

			const { parse, transform, initialValue, defaultValue } = options;

			const transformParam = (
				param: string | string[] | null,
			): (ReadT | string)[] | null => {
				if (!param) {
					return defaultValue ?? initialValue ?? null;
				}
				if (Array.isArray(param)) {
					if (param.length < 1) {
						return defaultValue ?? initialValue ?? null;
					}
					// Avoid passing the parse function directly into the map function,
					// because parse may inadvertently use the array index as its second argument.
					// Typically, map provides the array index as the second argument to its callback,
					// which can conflict with parse functions like numberAttribute that expect a fallbackValue as their second parameter.
					// This mismatch can lead to unexpected behavior, such as values being erroneously converted to array indices
					// instead of NaN (which would be correct)
					return parse
						? param.map((it) => parse(it))
						: transform
							? param.map((it) => transform(it))
							: param;
				}
				return [parse ? parse(param) : transform ? transform(param) : param];
			};

			const getParam = (params: Params) => {
				const param = params?.[key];

				return transformParam(param);
			};

			return toSignal(route.queryParams.pipe(map(getParam)), {
				initialValue: getParam(queryParams),
			});
		});
	}
}
