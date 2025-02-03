import { JsonPipe } from '@angular/common';
import { Component, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { linkedQueryParam } from 'ngxtension/linked-query-param';

@Component({
	template: `
		<div>
			@for (id of IDs; track $index) {
				<label>
					<input
						type="checkbox"
						[ngModel]="selectedCategoriesIds().includes(id)"
						(ngModelChange)="$event ? selectId(id) : deselectId(id)"
					/>
					{{ id }}
				</label>
			}
		</div>
	`,
	imports: [FormsModule, JsonPipe],
	styles: `
		div {
			padding: 20px;
		}
	`,
})
export default class LinkedQueryParamArrayCmp {
	IDs = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

	selectedCategoriesIds = linkedQueryParam<string[]>('selectedCategoriesIds', {
		parse: (x) => (x ? x.split(',').map((x) => x.trim()) : []),
		stringify: (x) => x.join(','),
	});

	constructor() {
		effect(() => {
			console.log(
				'selectedCategoriesIds Value: ',
				this.selectedCategoriesIds(),
			);
		});
	}

	selectId(id: string) {
		this.selectedCategoriesIds.update((x) => [...x, id]);
	}

	deselectId(id: string) {
		this.selectedCategoriesIds.update((x) => x.filter((x) => x !== id));
	}
}
