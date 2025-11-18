import { JsonPipe } from '@angular/common';
import { Component, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
	linkedQueryParam,
	paramToBoolean,
} from 'ngxtension/linked-query-param';

@Component({
	template: `
		<div>
			<pre>Show Deleted: {{ showDeleted() | json }}</pre>

			<div>
				<label>
					<input type="checkbox" [(ngModel)]="showDeleted" name="showDeleted" />
					Show Deleted signal
				</label>
			</div>
			<div>
				<label>
					<input
						type="checkbox"
						[(ngModel)]="showDeletedOtherSignal"
						name="showDeletedOtherSignal"
					/>
					Show Deleted other signal (same query param)
				</label>
			</div>

			<button type="button" (click)="showDeleted.set(true)">True</button>
			<button type="button" (click)="showDeleted.set(false)">False</button>
			<button type="button" (click)="showDeleted.set(null)">Reset</button>
		</div>
	`,
	imports: [FormsModule, JsonPipe],
	styles: `
		div {
			padding: 20px;
		}
	`,
})
export default class LinkedQueryParamBooleansCmp {
	showDeleted = linkedQueryParam('showDeleted', {
		parse: (x) => x === 'true',
		stringify: (x) => (x ? 'true' : 'false'),
	});

	showDeletedOtherSignal = linkedQueryParam('showDeleted', {
		parse: (x) => x === 'true',
		stringify: (x) => (x ? 'true' : 'false'),
	});

	_withBuiltinBooleanParse = linkedQueryParam('showDeleted1', {
		parse: paramToBoolean({ defaultValue: true }),
	});
	_withBuiltinNoDefaultBooleanParse = linkedQueryParam('showDeleted1', {
		parse: paramToBoolean(),
	});

	constructor() {
		effect(() => {
			console.log('showDeleted Type: ', typeof this.showDeleted());
			console.log('showDeleted Value: ', this.showDeleted());
		});
	}
}
