import { HostAttributeToken, inject, type Injector } from '@angular/core';
import { assertInjector } from 'ngxtension/assert-injector';

/**
 * Options for the `injectAttribute` function.
 */
export type InjectAttributeOptions<T = unknown> = {
	/**
	 * Custom injector to use for dependency injection.
	 */
	injector?: Injector;
	/**
	 * Transform function to convert the string attribute value to the desired type.
	 * This is useful for type coercion (e.g., string to number or boolean).
	 */
	transform?: (value: string) => T;
};

//INSPIRED BY @netbasal ARTICLE https://medium.com/netanelbasal/streamlining-attribute-injection-in-angular-the-hostattributetoken-approach-494f5c1428b8

/**
 * Injects the value of a host attribute with a default value if the attribute is not present.
 * This is a simplified wrapper around Angular's `HostAttributeToken`
 *
 * @template T - The type of the attribute value
 * @param {string} key - The name of the attribute to inject
 * @param {T} defaultValue - The default value to return if the attribute is not present
 * @param {InjectAttributeOptions} options - Optional configuration for the injector
 * @returns {T} The attribute value or the default value
 *
 * @example
 * ```ts
 * export class Button {
 *   variation = injectAttribute<'primary' | 'secondary'>('variation', 'primary');
 * }
 * ```
 *
 * @example
 * <app-button variation="secondary" />
 */
export function injectAttribute<T>(
	key: string,
	defaultValue: T,
	options?: InjectAttributeOptions<T>,
): T {
	return assertInjector(injectAttribute, options?.injector, () => {
		const value = inject(new HostAttributeToken(key), { optional: true });

		if (value == null) {
			return defaultValue;
		}

		if (options?.transform) {
			return options.transform(value);
		}

		return value as T;
	});
}

/**
 * Injects the value of a host attribute that must be present.
 * Throws an error if the attribute is not provided.
 *
 * @template T - The type of the attribute value
 * @param {string} key - The name of the attribute to inject
 * @param {InjectAttributeOptions} options - Optional configuration for the injector
 * @returns {T} The attribute value
 * @throws {Error} If the attribute is not present in the host element
 */
export namespace injectAttribute {
	export function required<T>(
		key: string,
		options?: InjectAttributeOptions<T>,
	): T {
		return assertInjector(required, options?.injector, () => {
			const value = inject(new HostAttributeToken(key));
			return options?.transform ? options.transform(value) : (value as T);
		});
	}
}
