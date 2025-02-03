import { JsonPipe } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { linkedQueryParam } from 'ngxtension/linked-query-param';

@Component({
	template: `
		<div>
			<pre>SearchQuery: {{ searchQuery() | json }}</pre>

			<div>
				<label>
					Different inputs same signal:
					<input [(ngModel)]="searchQuery" name="a" placeholder="searchQuery" />
					<input [(ngModel)]="searchQuery" name="b" placeholder="searchQuery" />
				</label>
			</div>

			<div>
				<label>
					Different signals same query param:
					<input
						[(ngModel)]="differentSignalWithSearchQuery"
						name="c"
						placeholder="differentSignalWithSearchQuery"
					/>
				</label>
			</div>

			<button type="button" (click)="searchQuery.set('cool')">cool</button>
			<button type="button" (click)="searchQuery.set('great')">great</button>
			<button type="button" (click)="searchQuery.set(null)">Reset</button>
		</div>
	`,
	imports: [FormsModule, JsonPipe],
	styles: `
		div {
			padding: 20px;
		}
	`,
})
export default class LinkedQueryParamStringCmp {
	private titleService = inject(Title);

	searchQuery = linkedQueryParam('searchQuery', {
		// NOTE in docs that serialize should come after parse in order for types to work correctly
		// stringify: (x) => `${x}`,
		// parse: (x) => x ? parseInt(x, 10) : null,
	});

	differentSignalWithSearchQuery = linkedQueryParam('searchQuery', {
		defaultValue: 'default',
	});

	constructor() {
		effect(() => {
			const searchQuery = this.searchQuery();
			console.log('searchQuery Type: ', typeof searchQuery);
			console.log('searchQuery Value: ', searchQuery);

			if (searchQuery) {
				this.titleService.setTitle(searchQuery);
			} else {
				this.titleService.setTitle('No search query!');
			}
		});
	}
}
