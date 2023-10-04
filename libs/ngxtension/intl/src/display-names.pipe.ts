import {
	inject,
	LOCALE_ID,
	Pipe,
	type PipeTransform,
	type Provider,
} from '@angular/core';
import { createInjectionToken } from 'ngxtension/create-injection-token';

type DisplayNamesOptions = Omit<Intl.DisplayNamesOptions, 'type'>;

/**
 * @internal
 */
const defaultOptions: DisplayNamesOptions = {
	style: 'short',
	localeMatcher: 'lookup',
	fallback: 'code',
};

/**
 * @internal
 */
const [injectFn, provideFn] = createInjectionToken(() => defaultOptions);

/**
 * Provides a way to inject the options for the DisplayNamesPipe.
 *
 * @param options The options to use for the DisplayNamesPipe.
 * @returns The provider for the DisplayNamesPipe.
 */
export function provideDisplayNamesOptions(
	options: Partial<DisplayNamesOptions>
): Provider {
	return provideFn({ ...defaultOptions, ...options });
}

/**
 * This pipe is a wrapper around the [Intl.DisplayNames](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DisplayNames) API.
 *
 * @returns The display name of the code or the code as it is in case of errors.
 */
@Pipe({
	name: 'displayNames',
	standalone: true,
})
export class DisplayNamesPipe implements PipeTransform {
	readonly defaultOptions = injectFn();
	readonly locale = inject(LOCALE_ID);

	/**
	 * Displays the name of the given code in the given locale.
	 *
	 * @param code The code to transform.
	 * @param type DisplayNamesType to use.
	 * @param style Optional. The formatting style to use. Defaults to "short".
	 * @param locale Optional. The locale to use for the transformation. Defaults to LOCALE_ID.
	 * @returns The name of the given code in the given locale or the code itself if the name could not be found.
	 */
	transform(
		code: string,
		type: Intl.DisplayNamesType,
		style?: Intl.DisplayNamesOptions['style'],
		locale?: string | string[]
	): ReturnType<Intl.DisplayNames['of']> {
		try {
			return new Intl.DisplayNames(locale || this.locale, {
				...this.defaultOptions,
				type,
				...(style ? { style } : {}),
			}).of(code);
		} catch (e) {
			console.error(e);
			return code;
		}
	}
}
