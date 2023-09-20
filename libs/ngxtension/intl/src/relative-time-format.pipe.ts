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
const defaultOptions: Intl.RelativeTimeFormatOptions = {
	localeMatcher: 'best fit', // other values: "lookup"
	numeric: 'always', // other values: "auto"
	style: 'long', // other values: "short" or "narrow"
};

/**
 * @internal
 */
const RELATIVE_TIME_FORMAT_INITIALS =
	new InjectionToken<Intl.RelativeTimeFormatOptions>(
		'RELATIVE_TIME_FORMAT_INITIALS',
		{
			factory: () => defaultOptions,
		}
	);

/**
 * Provides a way to inject the options for the RelativeTimeFormatPipe.
 * @param options The options to use for the RelativeTimeFormatPipe.
 *
 * @returns The provider for the RelativeTimeFormatPipe.
 */
export function provideRelativeTimeFormatOptions(
	options: Intl.RelativeTimeFormatOptions
): Provider {
	return {
		provide: RELATIVE_TIME_FORMAT_INITIALS,
		useValue: { ...defaultOptions, ...options },
	};
}

/**
 * This pipe is a wrapper around the [Intl.RelativeTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat) API.
 *
 * @returns The relative time format of the value or the value as it is in case of errors.
 */
@Pipe({
	name: 'relativeTimeFormat',
	standalone: true,
})
export class RelativeTimeFormatPipe implements PipeTransform {
	readonly defaultOptions = inject(RELATIVE_TIME_FORMAT_INITIALS);
	readonly locale = inject(LOCALE_ID);

	/**
	 * Transforms the value into a relative time format.
	 *
	 * @param value The value to format.
	 * @param unit The unit of the value.
	 * @param locale Optional, the locale to use for the formatting.
	 * @returns The relative time format of the value or the value as it is in case of errors.
	 */
	transform(
		value: number,
		unit: Intl.RelativeTimeFormatUnit,
		locale?: string
	): ReturnType<Intl.RelativeTimeFormat['format']> {
		try {
			return new Intl.RelativeTimeFormat(
				locale || this.locale,
				this.defaultOptions
			).format(value, unit);
		} catch (e) {
			return value.toString();
		}
	}
}
