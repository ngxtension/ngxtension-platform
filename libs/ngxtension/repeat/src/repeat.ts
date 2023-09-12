import { NgFor } from '@angular/common';
import { Directive, Input } from '@angular/core';

/**
 * An extension of `NgFor` directive that allows consumers to iterate "x times" instead of through a list of items
 *
 * @param {number} count - a positive integer starting from 0
 *
 * @example
 *
 * ```html
 * <!-- before -->
 * <p *ngFor="let i of [0, 1, 2]">{{i}}</p>
 * <!-- after -->
 * <p *ngFor="let i; repeat: 3">{{i}}</p>
 * ```
 */
@Directive({
	standalone: true,
	selector: '[ngFor][ngForRepeat]',
})
export class Repeat extends NgFor<number> {
	@Input() set ngForRepeat(count: number) {
		if (Number.isNaN(count) || !Number.isInteger(count)) {
			throw new Error(
				`[Repeat] repeat requires an integer but ${count} is passed in`
			);
		}
		this.ngForOf = Array.from({ length: count }, (_, i) => i);
		this.ngForTrackBy = (i) => i;
	}
}
