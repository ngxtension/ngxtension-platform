import { JsonPipe } from '@angular/common';
import { Component, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { linkedQueryParam, paramToNumber } from 'ngxtension/linked-query-param';

@Component({
	template: `
		<div>
			<pre>Page Number: {{ pageNumber() | json }}</pre>
			<pre>Page Size: {{ pageSize() | json }}</pre>

			<div>
				<label>
					Page Number:
					<input
						[(ngModel)]="pageNumber"
						name="pageNumber"
						placeholder="pageNumber"
					/>
				</label>
			</div>

			<div>
				<label>
					Page Size:
					<input
						[(ngModel)]="pageSize"
						name="pageSize"
						placeholder="pageSize"
					/>

					<select [(ngModel)]="pageSize" name="pageSize">
						<option value="10">10</option>
						<option value="20">20</option>
						<option value="30">30</option>
						<option [ngValue]="null">null</option>
					</select>
				</label>
			</div>

			<button type="button" (click)="pageNumber.set(1)">page 1</button>
			<button type="button" (click)="pageNumber.set(2)">page 2</button>
			<button type="button" (click)="changeBoth()">Change both</button>
			<button type="button" (click)="pageNumber.set(null)">Reset</button>
		</div>
	`,
	imports: [FormsModule, JsonPipe],
	styles: `
		div {
			padding: 20px;
		}
	`,
})
export default class LinkedQueryParamNumberCmp {
	pageNumber = linkedQueryParam('page', { parse: (x) => (x ? +x : null) });
	pageSize = linkedQueryParam('pageSize', { parse: (x) => (x ? +x : null) });

	_withBuiltinNumberParse = linkedQueryParam('page', {
		parse: paramToNumber({ defaultValue: 1 }),
	});
	_withBuiltinNoDefaultNumberParse = linkedQueryParam('page', {
		parse: paramToNumber(),
	});

	constructor() {
		effect(() => {
			console.log('pageNumber Type: ', typeof this.pageNumber());
			console.log('pageNumber Value: ', this.pageNumber());
		});
	}

	changeBoth() {
		this.pageNumber.set(20);
		this.pageSize.set(30);
	}
}
