import { Component, effect, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { linkedQueryParam, paramToNumber } from 'ngxtension/linked-query-param';

@Component({
	selector: 'app-pagination',
	template: `
		<div class="pagination">
			<input [(ngModel)]="page" type="number" placeholder="Page number" />
			<select [(ngModel)]="page" name="page">
				@for (page of pages(); track page) {
					<option [value]="page">{{ page }}</option>
				}
			</select>

			@for (page of pages(); track page) {
				<button
					(click)="pageParam.set(page)"
					type="button"
					class="page-button"
					[class.active]="pageParam() === page"
				>
					{{ page }}
				</button>
			}
			<p>Page model: {{ page() }}</p>
			<p>Page param: {{ pageParam() }}</p>
		</div>
	`,
	styles: `
		.pagination {
			display: flex;
			flex-direction: column;
			gap: 1rem;
			padding: 1rem;
			border: 1px solid #e2e8f0;
			border-radius: 0.5rem;
			background: #f8fafc;
			align-items: flex-start;
		}
		/* Ensure page buttons are shown in a row */
		.pagination .page-buttons,
		/* Also style direct button row if not wrapped in .page-buttons */
		.pagination .page-button-row {
			display: flex;
			flex-direction: row;
			gap: 0.5rem;
			justify-content: center;
			width: 100%;
			margin: 0.5rem 0;
		}
		.pagination button.page-button {
			padding: 0.5rem 1rem;
			border: 1px solid #cbd5e1;
			border-radius: 0.25rem;
			font-size: 1rem;
			background: #fff;
			color: #334155;
			cursor: pointer;
			transition:
				border-color 0.15s ease-in-out,
				background 0.15s,
				color 0.15s;
			min-width: 2.5rem;
			margin: 0;
		}
		.pagination button.page-button:hover,
		.pagination button.page-button:focus {
			border-color: #3b82f6;
			background: #e0e7ef;
			color: #1d4ed8;
			outline: none;
		}
		.pagination button.page-button.active {
			background: #3b82f6;
			color: #fff;
			border-color: #2563eb;
			cursor: default;
		}
		.pagination select,
		.pagination input {
			padding: 0.5rem;
			border: 1px solid #cbd5e1;
			border-radius: 0.25rem;
			font-size: 1rem;
			width: 100%;
			transition: border-color 0.15s ease-in-out;
		}
		.pagination select:hover,
		.pagination input:hover {
			border-color: #94a3b8;
		}
		.pagination select:focus,
		.pagination input:focus {
			outline: none;
			border-color: #3b82f6;
			box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
		}
		.pagination p {
			margin: 0.5rem 0;
			color: #64748b;
			font-size: 0.875rem;
		}
	`,
	imports: [FormsModule],
})
export class PaginationComponent {
	// Model signal for two-way binding
	readonly pageKey = model<string>('');
	readonly page = model<number>(0);

	readonly pages = signal<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

	readonly pageParam = linkedQueryParam(this.pageKey, {
		source: this.page,
		parse: paramToNumber({ defaultValue: 1 }),
	});

	constructor() {
		effect(() => {
			console.log('pageKey: ', this.pageKey());
			console.log('page: ', this.page());
			console.log('type of page: ', typeof this.page());
		});
	}
}

@Component({
	template: `
		<div>
			<h3>Dynamic Key and Usage with model signal and parse</h3>

			<label>
				Page Key:
				<input [(ngModel)]="pageKey" name="pageKey" placeholder="pageKey" />
			</label>

			<label>
				Page Value:
				<input
					[(ngModel)]="pageValue"
					name="pageValue"
					placeholder="pageValue"
				/>
			</label>

			<hr />
			<br />

			<app-pagination [(pageKey)]="pageKey" [(page)]="pageValue" />
		</div>
	`,
	imports: [FormsModule, PaginationComponent],
	styles: `
		div {
			padding: 20px;
		}
	`,
})
export default class LinkedQueryParamDynamicCmp {
	readonly pageKey = linkedQueryParam<string>('pageKey', {
		defaultValue: 'page',
	});
	readonly pageValue = signal<number>(3);
}
