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
const defaultOptions: Intl.PluralRulesOptions = {
	localeMatcher: 'best fit', // other values: "lookup",
	type: 'cardinal', // other values: "ordinal"
};

/**
 * @internal
 */
const PLURAL_RULES_INITIALS = new InjectionToken<Intl.PluralRulesOptions>(
	'PLURAL_RULES_INITIALS',
	{
		factory: () => defaultOptions,
	}
);

/**
 * Provides a way to inject the options for the PluralRules.
 *
 * @param options The options to use for the PluralRules.
 * @returns The provider for the PluralRules.
 */
export function providePluralRulesOptions(
	options: Intl.PluralRulesOptions
): Provider {
	return {
		provide: PLURAL_RULES_INITIALS,
		useValue: { ...defaultOptions, ...options },
	};
}

/**
 * This pipe is a wrapper around the [Intl.PluralRules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/PluralRules) API.
 * It takes a value and returns the plural category for that value.
 *
 * @returns The plural category for the value or the value as string in case of errors.
 */
@Pipe({
	name: 'pluralRules',
	standalone: true,
})
export class PluralRulesPipe implements PipeTransform {
	readonly defaultOptions = inject(PLURAL_RULES_INITIALS);
	readonly locale = inject(LOCALE_ID);

	/**
	 * Transforms the value into a plural category.
	 *
	 * @param value The value to transform.
	 * @param locale Optional, the locale to use for the formatting.
	 * @returns The plural category for the value or the value as string in case of errors.
	 */
	transform(
		value: number,
		locale?: string
	): ReturnType<Intl.PluralRules['select']> | string {
		try {
			return new Intl.PluralRules(
				locale || this.locale,
				this.defaultOptions
			).select(value);
		} catch (e) {
			return String(value);
		}
	}
}
