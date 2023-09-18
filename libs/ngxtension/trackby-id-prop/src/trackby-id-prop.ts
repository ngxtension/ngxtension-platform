//INSPIRED BY https://medium.com/ngconf/make-trackby-easy-to-use-a3dd5f1f733b
import { NgForOf } from '@angular/common';
import { Directive, Input, inject, type NgIterable } from '@angular/core';

@Directive({
	selector: '[ngForTrackById]',
	standalone: true,
})
export class TrackById<T extends { id: string | number }> {
	@Input() ngForOf!: NgIterable<T>;
	private ngFor = inject(NgForOf<T>, { self: true });

	constructor() {
		this.ngFor.ngForTrackBy = (index: number, item: T) => item.id;
	}
}

@Directive({
	selector: '[ngForTrackByProp]',
	standalone: true,
})
export class TrackByProp<T> {
	@Input() ngForOf!: NgIterable<T>;
	private ngFor = inject(NgForOf<T>, { self: true });

	@Input({ required: true })
	set ngForTrackByProp(trackByProp: keyof T) {
		if (!trackByProp) return;
		this.ngFor.ngForTrackBy = (index: number, item: T) => item[trackByProp];
	}
}

export const TRACK_BY_DIRECTIVES = [TrackById, TrackByProp] as const;
