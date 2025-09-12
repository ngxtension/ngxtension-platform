import { JsonPipe } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { linkedQueryParam } from 'ngxtension/linked-query-param';

interface MyFilters {
	a: string;
	b: string;
	c: {
		d: string;
		e: string;
	};
}

@Component({
	template: `
		<div>
			MyFilters:
			<br />
			<pre>
        {{ myFilters() | json }}
      </pre
			>
			<br />
			A:
			<input
				[ngModel]="myFilters().a"
				(ngModelChange)="updateAFilter($event)"
				name="a"
			/>
			<br />
			B:
			<input
				[(ngModel)]="myFilters().b"
				(ngModelChange)="updateBFilter($event)"
				name="b"
			/>
			<br />
			D:
			<input
				[(ngModel)]="myFilters().c.d"
				(ngModelChange)="updateDFilter($event)"
				name="c.d"
			/>
			<br />
			E:
			<input
				[(ngModel)]="myFilters().c.e"
				(ngModelChange)="updateEFilter($event)"
				name="c.e"
			/>
			<br />
			<br />
			<button type="button" (click)="updateAFilter('aaa')">update a</button>
			<button type="button" (click)="updateBFilter('bbb')">update b</button>
			<button type="button" (click)="updateDFilter('ddd')">update d</button>
			<button type="button" (click)="updateEFilter('eee')">update e</button>
			<button type="button" (click)="updateAll()">update all</button>
			<button type="button" (click)="resetAll()">reset all</button>
			<br />
			<hr />
			<br />
		</div>
	`,
	imports: [FormsModule, JsonPipe],
	styles: `
		div {
			padding: 20px;
		}
	`,
})
export default class LinkedQueryParamObjectCmp {
	private router = inject(Router);

	myFilters = linkedQueryParam<MyFilters>('filters', {
		parse: (x) =>
			x
				? JSON.parse(x)
				: {
						a: '',
						b: '',
						c: {
							d: '',
							e: '',
						},
					},
		stringify: (x) => JSON.stringify(x),
	});

	constructor() {
		effect(() => {
			console.log('myFilters Value: ', this.myFilters());
		});
	}

	updateAFilter(a: string) {
		this.myFilters.update((x) => ({ ...x, a }));
	}

	updateBFilter(b: string) {
		this.myFilters.update((x) => ({ ...x, b }));
	}

	updateDFilter(d: string) {
		this.myFilters.update((x) => ({ ...x, c: { ...x.c, d } }));
	}

	updateEFilter(e: string) {
		this.myFilters.update((x) => ({ ...x, c: { ...x.c, e } }));
	}

	updateAll() {
		this.myFilters.update(() => {
			return {
				a: '1aa',
				b: '2bb',
				c: {
					d: '3dd',
					e: '4ee',
				},
			};
		});
	}

	resetAll() {
		this.router.navigate([], {
			queryParams: {
				filters: null,
			},
		});
	}
}
