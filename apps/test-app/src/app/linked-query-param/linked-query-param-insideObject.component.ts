import { JsonPipe } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { linkedQueryParam } from 'ngxtension/linked-query-param';

@Component({
	template: `
		<div>
			<label>
				SearchQuery:
				<input [(ngModel)]="filterState.searchQuery" name="searchQuery" />

				<button type="button" (click)="filterState.searchQuery.set(null)">
					reset
				</button>
			</label>
			<br />

			<label>
				Size:
				<select [(ngModel)]="filterState.pageSize" name="pageSize">
					<option value="10">10</option>
					<option value="20">20</option>
					<option value="30">30</option>
					<option [ngValue]="null">null</option>
				</select>
			</label>
			<br />
			<label>
				Show deleted:
				<input
					[(ngModel)]="filterState.showDeleted"
					name="showDeleted"
					type="checkbox"
				/>
			</label>
			<br />

			<label>
				Page:
				<input [(ngModel)]="filterState.pageNumber" name="pageNumber" />

				<button type="button" (click)="filterState.pageNumber.set(1)">1</button>
				<button type="button" (click)="filterState.pageNumber.set(2)">2</button>
				<button type="button" (click)="filterState.pageNumber.set(3)">3</button>
				<button type="button" (click)="filterState.pageNumber.set(null)">
					null
				</button>
			</label>
			<br />

			<label>
				SortBy:
				<select [(ngModel)]="filterState.sortBy" name="sortBy">
					<option value="name">name</option>
					<option value="age">age</option>
				</select>
			</label>
			<br />

			<label>
				Direction:
				<select [(ngModel)]="filterState.direction" name="direction">
					<option value="asc">asc</option>
					<option value="desc">desc</option>
				</select>
			</label>

			<br />

			<button type="button" (click)="filterState.pageSize.set(10)">
				pageSize 10
			</button>
			<button type="button" (click)="filterState.pageSize.set(20)">
				pageSize 20
			</button>
			<button type="button" (click)="filterState.pageSize.set(null)">
				pageSize null
			</button>
			<button type="button" (click)="resetAll()">reset all</button>
			<hr />
			<br />
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
export default class LinkedQueryParamInsideObjectCmp {
	private router = inject(Router);

	filterState = {
		searchQuery: linkedQueryParam('searchQuery'),
		showDeleted: linkedQueryParam('showDeleted', {
			parse: (x) => x === 'true',
		}),
		pageNumber: linkedQueryParam('page', { parse: (x) => (x ? +x : null) }),
		pageSize: linkedQueryParam('pageSize', { parse: (x) => (x ? +x : null) }),
		sortBy: linkedQueryParam('sortBy', { defaultValue: 'name' }),
		direction: linkedQueryParam<'asc' | 'desc'>('direction', {
			defaultValue: 'asc',
		}),
	};

	constructor() {
		Object.values(this.filterState).forEach((x) => {
			effect(() => {
				console.log(x());
			});
		});
	}

	resetAll() {
		this.router.navigate([], {
			queryParams: {
				searchQuery: null,
				showDeleted: null,
				page: null,
				pageSize: null,
				sortBy: null,
				direction: null,
			},
		});
	}
}
