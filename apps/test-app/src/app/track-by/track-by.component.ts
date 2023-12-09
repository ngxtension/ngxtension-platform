import { NgFor } from '@angular/common';
import {
	Component,
	DestroyRef,
	ElementRef,
	ViewChild,
	inject,
} from '@angular/core';
import { TrackById, TrackByProp } from 'ngxtension/trackby-id-prop';

@Component({
	standalone: true,
	template: `
		<ul #parentNoTrackBy>
			<li *ngFor="let person of people">
				{{ person.id }}. {{ person.firstName }} {{ person.lastName }}
			</li>
		</ul>
		<hr />
		<ul #parentTrackBy>
			<li *ngFor="let person of people; trackById">
				{{ person.id }}. {{ person.firstName }} {{ person.lastName }}
			</li>
		</ul>
		<ul #parentTrackByProp>
			<li *ngFor="let person of people; trackByProp: 'firstName'">
				{{ person.id }}. {{ person.firstName }} {{ person.lastName }}
			</li>
		</ul>
		<button (click)="add()">add</button>
		<hr />
		<p id="without-track-by">
			Without TrackBy mutations: {{ mutationsLength.withoutTrackBy }}
		</p>
		<p id="with-track-by">
			With TrackBy mutations: {{ mutationsLength.withTrackBy }}
		</p>
		<p id="with-track-by-prop">
			With TrackBy prop mutations: {{ mutationsLength.withTrackByProp }}
		</p>
	`,
	imports: [NgFor, TrackById, TrackByProp],
})
export default class TrackByTest {
	people = [
		{ id: 1, firstName: 'Chau', lastName: 'Tran' },
		{ id: 2, firstName: 'Enea', lastName: 'Jahollari' },
		{ id: 3, firstName: 'Daniele', lastName: 'Morosinotto' },
	];
	mutationsLength = { withTrackBy: 0, withTrackByProp: 0, withoutTrackBy: 0 };

	private destroyRef = inject(DestroyRef);
	private mutationCallback =
		(type: keyof typeof this.mutationsLength): MutationCallback =>
		(mutations) => {
			this.mutationsLength[type] += mutations.length;
		};

	@ViewChild('parentNoTrackBy', { static: true }) set parentNoTrackBy({
		nativeElement,
	}: ElementRef<HTMLUListElement>) {
		this.setup('withoutTrackBy', nativeElement);
	}

	@ViewChild('parentTrackBy', { static: true }) set parentTrackBy({
		nativeElement,
	}: ElementRef<HTMLUListElement>) {
		this.setup('withTrackBy', nativeElement);
	}

	@ViewChild('parentTrackByProp', { static: true }) set parentTrackByProp({
		nativeElement,
	}: ElementRef<HTMLUListElement>) {
		this.setup('withTrackByProp', nativeElement);
	}

	add() {
		const nextId = this.people.length + 1;
		this.people = [
			// NOTE: purposely clone
			...this.people.map((person) => ({ ...person })),
			{ id: nextId, firstName: 'Random ' + nextId, lastName: 'Last ' + nextId },
		];
	}

	private setup(
		type: keyof typeof this.mutationsLength,
		nativeElement: HTMLUListElement,
	) {
		const mutationObserver = new MutationObserver(this.mutationCallback(type));
		mutationObserver.observe(nativeElement, { childList: true });
		this.destroyRef.onDestroy(() => {
			mutationObserver.disconnect();
		});
	}
}
