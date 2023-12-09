import { Pipe, type PipeTransform } from '@angular/core';

/**
 * This pipe is a wrapper around the [Intl.supportedValuesOf](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/supportedValuesOf) method.
 *
 * @returns An array containing the supported calendar, collation, currency, numbering systems, or unit values supported by the implementation.
 */
@Pipe({
	name: 'supportedValuesOf',
	standalone: true,
})
export class SupportedValuesOf implements PipeTransform {
	/**
	 * Transforms a key into an array containing the supported calendar, collation, currency, numbering systems, or unit values supported by the implementation.
	 *
	 * @param key A key string indicating the category of values to be returned. This is one of: "calendar", "collation", "currency","numberingSystem", "timeZone", "unit"
	 * @returns An array containing the supported values for the key or an empty array if the input is invalid.
	 */
	transform(
		key:
			| 'calendar'
			| 'collation'
			| 'currency'
			| 'numberingSystem'
			| 'timeZone'
			| 'unit',
	): string[] {
		try {
			return Intl.supportedValuesOf(key);
		} catch (e) {
			console.error(e);
			return [];
		}
	}
}
