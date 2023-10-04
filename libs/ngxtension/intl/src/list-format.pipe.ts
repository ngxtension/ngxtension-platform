import {
	inject,
	LOCALE_ID,
	Pipe,
	type PipeTransform,
	type Provider,
} from '@angular/core';
import { createInjectionToken } from 'ngxtension/create-injection-token';

/**
 * @internal
 */
const defaultOptions: Intl.ListFormatOptions = {
	style: 'long',
	type: 'conjunction',
};

/**
 * @internal
 */
const [injectFn, provideFn] = createInjectionToken(() => defaultOptions);

/**
 * Provides a way to inject the options for the ListFormatPipe.
 *
 * @param options The options to use for the ListFormatPipe.
 * @returns The provider for the ListFormatPipe.
 */
export function provideListFormatOptions(
	options: Partial<Intl.ListFormatOptions>
): Provider {
	return provideFn({ ...defaultOptions, ...options });
}

/**
 * This pipe is a wrapper around the [Intl.ListFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/ListFormat) API.
 *
 * @returns The formatted list of values or the list as string in case of errors.
 */
@Pipe({
	name: 'listFormat',
	standalone: true,
})
export class ListFormatPipe implements PipeTransform {
	readonly defaultOptions = injectFn();
	readonly locale = inject(LOCALE_ID);

	/**
	 * Transforms the list of values into a formatted string.
	 *
	 * @param value The list of values to format.
	 * @param style Optional. The formatting style to use. Defaults to "long".
	 * @param locale Optional. The locale to use for the transformation. Defaults to LOCALE_ID.
	 * @returns The formatted list of values or the list as string in case of errors.
	 */
	transform(
		value: Iterable<string>,
		style?: Intl.ListFormatOptions['style'],
		locale?: string | string[]
	): string {
		try {
			return new Intl.ListFormat(locale || this.locale, {
				...this.defaultOptions,
				...(style ? { style } : {}),
			}).format(Array.from(value));
		} catch (e) {
			console.error(e);
			return Array.from(value).join(', ');
		}
	}
}
