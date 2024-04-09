import { Pipe, type PipeTransform } from '@angular/core';

export const lengthErrorMessageBuilder = (value: unknown) =>
	`[Repeat] repeat requires an positive integer but "${value}" is passed in`;

export const startAtErrorMessageBuilder = (value: unknown) =>
	`[Repeat] repeat startAt requires an integer but "${value}" is passed in`;

/**
 * Returns an array of numbers starting from a given startAt value up to a specified length.
 *
 * @param {number} length - The number of elements to include in the resulting array.
 * @param {number} [startAt=0] - The value at which to start the sequence. Defaults to 0 if not provided.
 * @returns {number[]} - An array of numbers starting from startAt and incremented by 1 up to the specified length.
 * @throws {Error} - If length is not a positive integer.
 *
 * @example
 * ```html
 * @for (i of 5 | repeat; track i) {
 * <p>Nr. {{i}}</p>
 * }
 *
 * <hr/>
 *
 * @for (i of 5 | repeat: 5; track i) {
 * <p>Nr. {{i}}</p>
 * }
 *
 * <!-- Output -->
 * Nr. 0
 * Nr. 1
 * Nr. 2
 * Nr. 3
 * Nr. 4
 * ----------------
 * Nr. 5
 * Nr. 6
 * Nr. 7
 * Nr. 8
 * Nr. 9
 * ```
 */
@Pipe({
	standalone: true,
	name: 'repeat',
})
export class RepeatPipe implements PipeTransform {
	/**
	 * Returns an array of numbers starting from a given startAt value up to a specified length.
	 *
	 * @param {number} length - The number of elements to include in the resulting array.
	 * @param {number} [startAt=0] - The value at which to start the sequence. Defaults to 0 if not provided.
	 * @returns {number[]} - An array of numbers starting from startAt and incremented by 1 up to the specified length.
	 * @throws {Error} - If length is not a positive integer.
	 *
	 * @example
	 * ```html
	 * @for (i of 5 | repeat; track i) {
	 * <p>Nr. {{i}}</p>
	 * }
	 *
	 * <hr/>
	 *
	 * @for (i of 5 | repeat: 5; track i) {
	 * <p>Nr. {{i}}</p>
	 * }
	 *
	 * <!-- Output -->
	 * Nr. 0
	 * Nr. 1
	 * Nr. 2
	 * Nr. 3
	 * Nr. 4
	 * ----------------
	 * Nr. 5
	 * Nr. 6
	 * Nr. 7
	 * Nr. 8
	 * Nr. 9
	 * ```
	 */
	transform(length: number, startAt = 0): number[] {
		if (Number.isNaN(length) || !Number.isInteger(length) || length < 0) {
			throw new Error(lengthErrorMessageBuilder(length));
		}
		if (Number.isNaN(startAt) || !Number.isInteger(startAt)) {
			throw new Error(startAtErrorMessageBuilder(startAt));
		}
		return Array.from({ length }, (_, index) => index + startAt);
	}
}
