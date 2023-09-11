import { NgFor } from '@angular/common';
import { Directive, Input } from '@angular/core';

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
