//INSPIRED BY https://medium.com/ngconf/make-trackby-easy-to-use-a3dd5f1f733b
import { NgForOf } from '@angular/common';
import {
	Directive,
	Input,
	Provider,
	inject,
	type NgIterable,
} from '@angular/core';

@Directive({
	selector: '[ngForTrackById]',
	standalone: true,
})
export class NgForTrackByIdDirective<T extends { id: string | number }> {
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
export class NgForTrackByPropDirective<T> {
	@Input() ngForOf!: NgIterable<T>;
	private ngFor = inject(NgForOf<T>, { self: true });

	@Input()
	set ngForTrackByProp(trackByProp: keyof T) {
		if (!trackByProp) return; //throw new Error("You must specify trackByProp:'VALID_PROP_NAME'");
		this.ngFor.ngForTrackBy = (index: number, item: T) => item[trackByProp];
	}
}

export const TrackByDirectives: Provider[] = [
	NgForTrackByIdDirective,
	NgForTrackByPropDirective,
];
