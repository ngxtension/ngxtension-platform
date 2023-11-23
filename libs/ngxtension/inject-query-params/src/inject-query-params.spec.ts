import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { injectQueryParams } from './inject-query-params';

describe(injectQueryParams.name, () => {
	it('returns a signal everytime the query params change based on the param passed to the fn', async () => {
		TestBed.configureTestingModule({
			providers: [
				provideRouter([{ path: 'search', component: SearchComponent }]),
			],
		});

		const harness = await RouterTestingHarness.create();

		const instance = await harness.navigateByUrl(
			'/search?query=Angular',
			SearchComponent
		);

		expect(instance.queryParams()).toEqual({ query: 'Angular' });
		expect(instance.searchParam()).toEqual('Angular');
		expect(instance.paramKeysList()).toEqual(['query']);

		await harness.navigateByUrl('/search?query=IsCool!&id=2');

		expect(instance.queryParams()).toEqual({ query: 'IsCool!', id: '2' });
		expect(instance.searchParam()).toEqual('IsCool!');
		expect(instance.paramKeysList()).toEqual(['query', 'id']);
	});
});

@Component({
	standalone: true,
	template: ``,
})
export class SearchComponent {
	queryParams = injectQueryParams();
	searchParam = injectQueryParams('query');
	paramKeysList = injectQueryParams((params) => Object.keys(params));
}
