import {
	inject,
	InjectionToken,
	LOCALE_ID,
	Pipe,
	PipeTransform,
	Provider,
} from '@angular/core';

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
const LIST_FORMAT_INITIALS = new InjectionToken<Intl.ListFormatOptions>(
	'LIST_FORMAT_INITIALS',
	{
		factory: () => defaultOptions,
	}
);

/**
 * Provides a way to inject the options for the ListFormatPipe.
 *
 * @param options The options to use for the ListFormatPipe.
 * @returns The provider for the ListFormatPipe.
 */
export function provideListFormatOptions(
	options: Intl.ListFormatOptions
): Provider {
	return {
		provide: LIST_FORMAT_INITIALS,
		useValue: { ...defaultOptions, ...options },
	};
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
	readonly defaultOptions = inject(LIST_FORMAT_INITIALS);
	readonly locale = inject(LOCALE_ID);

	/**
	 * Transforms the list of values into a formatted string.
	 *
	 * @param value The list of values to format.
	 * @param locale Optional, the locale to use for the formatting.
	 * @returns The formatted list of values or the list as string in case of errors.
	 */
	transform(value: Iterable<string>, locale?: string | string[]): string {
		try {
			return new Intl.ListFormat(
				locale || this.locale,
				this.defaultOptions
			).format(Array.from(value));
		} catch (e) {
			return Array.from(value).join(', ');
		}
	}
}
