import { Component, numberAttribute } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { injectQueryParams } from './inject-query-params';

@Component({
	standalone: true,
	template: ``,
})
export class SearchComponent {
	queryParams = injectQueryParams();
	idParam = injectQueryParams('id', { transform: numberAttribute });
	idParams = injectQueryParams.array('id', { transform: numberAttribute });
	searchParam = injectQueryParams('query');
	searchParams = injectQueryParams.array('query');
	paramKeysList = injectQueryParams((params) => Object.keys(params));
}

describe(injectQueryParams.name, () => {
	beforeEach(async () => {
		TestBed.configureTestingModule({
			providers: [
				provideRouter([{ path: 'search', component: SearchComponent }]),
			],
		});
	});

	it('returns a signal everytime the query params change based on the param passed to the fn and transform fn', async () => {
		const harness = await RouterTestingHarness.create();

		const instance = await harness.navigateByUrl(
			'/search?query=Angular',
			SearchComponent,
		);

		expect(instance.queryParams()).toEqual({ query: 'Angular' });
		expect(instance.searchParam()).toEqual('Angular');
		expect(instance.idParam()).toEqual(null);
		expect(instance.paramKeysList()).toEqual(['query']);

		await harness.navigateByUrl('/search?query=IsCool!&id=2');

		expect(instance.queryParams()).toEqual({ query: 'IsCool!', id: '2' });
		expect(instance.idParam()).toEqual(2);
		expect(instance.searchParam()).toEqual('IsCool!');
		expect(instance.paramKeysList()).toEqual(['query', 'id']);
	});

	it('returns a signal everytime the query params change with number', async () => {
		const harness = await RouterTestingHarness.create();

		const instance = await harness.navigateByUrl(
			'/search?id=Angular',
			SearchComponent,
		);

		expect(instance.queryParams()).toEqual({ id: 'Angular' });
		expect(instance.idParam()).toEqual(NaN);
		expect(instance.paramKeysList()).toEqual(['id']);

		await harness.navigateByUrl('/search?&id=2.2');

		expect(instance.queryParams()).toEqual({ id: '2.2' });
		expect(instance.idParam()).toEqual(2.2);
		expect(instance.paramKeysList()).toEqual(['id']);
	});

	it('returns a signal for a single query parameter', async () => {
		const harness = await RouterTestingHarness.create();
		const instance = await harness.navigateByUrl(
			'/search?query=Angular',
			SearchComponent,
		);

		expect(instance.queryParams()).toEqual({ query: 'Angular' });
		expect(instance.searchParam()).toEqual('Angular');
		expect(instance.idParam()).toEqual(null);
		expect(instance.paramKeysList()).toEqual(['query']);
	});

	it('returns a signal for numeric query parameters', async () => {
		const harness = await RouterTestingHarness.create();
		const instance = await harness.navigateByUrl(
			'/search?id=42',
			SearchComponent,
		);

		expect(instance.queryParams()).toEqual({ id: '42' });
		expect(instance.idParam()).toEqual(42);
		expect(instance.paramKeysList()).toEqual(['id']);
	});

	it('returns a signal for query parameters with special characters', async () => {
		const harness = await RouterTestingHarness.create();
		const instance = await harness.navigateByUrl(
			'/search?query=Hello%20World',
			SearchComponent,
		);

		expect(instance.queryParams()).toEqual({ query: 'Hello World' });
		expect(instance.searchParam()).toEqual('Hello World');
		expect(instance.paramKeysList()).toEqual(['query']);
	});

	it('returns a signal for query parameters with no transform', async () => {
		const harness = await RouterTestingHarness.create();
		const instance = await harness.navigateByUrl(
			'/search?query=Angular',
			SearchComponent,
		);

		expect(instance.queryParams()).toEqual({ query: 'Angular' });
		expect(instance.searchParam()).toEqual('Angular');
		expect(instance.paramKeysList()).toEqual(['query']);
	});
});

describe(injectQueryParams.array.name, () => {
	beforeEach(async () => {
		TestBed.configureTestingModule({
			providers: [
				provideRouter([{ path: 'search', component: SearchComponent }]),
			],
		});
	});

	it('returns a signal everytime the query params change based on the param passed to the fn and transform fn', async () => {
		const harness = await RouterTestingHarness.create();

		const instance = await harness.navigateByUrl(
			'/search?query=Angular&query=Analog',
			SearchComponent,
		);

		expect(instance.queryParams()).toEqual({ query: ['Angular', 'Analog'] });
		expect(instance.searchParams()).toEqual(['Angular', 'Analog']);
		expect(instance.idParams()).toEqual(null);
		expect(instance.paramKeysList()).toEqual(['query']);

		await harness.navigateByUrl('/search?query=IsCool!&query=IsNotCool&id=2');

		expect(instance.queryParams()).toEqual({
			query: ['IsCool!', 'IsNotCool'],
			id: '2',
		});
		expect(instance.idParams()).toEqual([2]);
		expect(instance.searchParams()).toEqual(['IsCool!', 'IsNotCool']);
		expect(instance.paramKeysList()).toEqual(['query', 'id']);
	});

	it('returns a signal everytime the query params change with number', async () => {
		const harness = await RouterTestingHarness.create();

		const instance = await harness.navigateByUrl(
			'/search?id=Angular&id=Analog',
			SearchComponent,
		);

		expect(instance.queryParams()).toEqual({ id: ['Angular', 'Analog'] });
		expect(instance.idParams()).toEqual([NaN, NaN]);
		expect(instance.paramKeysList()).toEqual(['id']);

		await harness.navigateByUrl('/search?&id=2.2&id=5');

		expect(instance.queryParams()).toEqual({ id: ['2.2', '5'] });
		expect(instance.idParams()).toEqual([2.2, 5]);
		expect(instance.paramKeysList()).toEqual(['id']);
	});

	it('returns a signal for empty query params', async () => {
		const harness = await RouterTestingHarness.create();
		const instance = await harness.navigateByUrl('/search', SearchComponent);

		expect(instance.queryParams()).toEqual({});
		expect(instance.searchParam()).toEqual(null);
		expect(instance.idParam()).toEqual(null);
		expect(instance.paramKeysList()).toEqual([]);
	});

	it('returns a signal for multiple query parameters', async () => {
		const harness = await RouterTestingHarness.create();
		const instance = await harness.navigateByUrl(
			'/search?query=Angular&id=2',
			SearchComponent,
		);

		expect(instance.queryParams()).toEqual({ query: 'Angular', id: '2' });
		expect(instance.searchParam()).toEqual('Angular');
		expect(instance.idParam()).toEqual(2);
		expect(instance.paramKeysList()).toEqual(['query', 'id']);
	});

	it('returns a signal for query parameters with an array', async () => {
		const harness = await RouterTestingHarness.create();
		const instance = await harness.navigateByUrl(
			'/search?query=Angular&query=React',
			SearchComponent,
		);

		expect(instance.queryParams()).toEqual({ query: ['Angular', 'React'] });
		expect(instance.searchParams()).toEqual(['Angular', 'React']);
	});

	it('returns a signal for empty array query parameters', async () => {
		const harness = await RouterTestingHarness.create();
		const instance = await harness.navigateByUrl('/search', SearchComponent);

		expect(instance.queryParams()).toEqual({});
		expect(instance.idParams()).toEqual(null);
	});

	it('returns a signal for array query parameters with a single item', async () => {
		const harness = await RouterTestingHarness.create();
		const instance = await harness.navigateByUrl(
			'/search?query=Angular',
			SearchComponent,
		);

		expect(instance.queryParams()).toEqual({ query: 'Angular' });
		expect(instance.searchParams()).toEqual(['Angular']);
	});

	it('returns a signal for array query parameters with multiple items', async () => {
		const harness = await RouterTestingHarness.create();
		const instance = await harness.navigateByUrl(
			'/search?query=Angular&query=React',
			SearchComponent,
		);

		expect(instance.queryParams()).toEqual({ query: ['Angular', 'React'] });
		expect(instance.searchParams()).toEqual(['Angular', 'React']);
	});

	it('returns a signal for numeric array query parameters', async () => {
		const harness = await RouterTestingHarness.create();
		const instance = await harness.navigateByUrl(
			'/search?id=42&id=7',
			SearchComponent,
		);

		expect(instance.queryParams()).toEqual({ id: ['42', '7'] });
		expect(instance.idParams()).toEqual([42, 7]);
	});

	it('returns a signal for array query parameters with special characters', async () => {
		const harness = await RouterTestingHarness.create();
		const instance = await harness.navigateByUrl(
			'/search?query=Hello%20World&query=Hi%20There',
			SearchComponent,
		);

		expect(instance.queryParams()).toEqual({
			query: ['Hello World', 'Hi There'],
		});
		expect(instance.searchParams()).toEqual(['Hello World', 'Hi There']);
	});

	it('returns a signal for array query parameters with no transform', async () => {
		const harness = await RouterTestingHarness.create();
		const instance = await harness.navigateByUrl(
			'/search?query=Angular&query=React',
			SearchComponent,
		);

		expect(instance.queryParams()).toEqual({ query: ['Angular', 'React'] });
		expect(instance.searchParams()).toEqual(['Angular', 'React']);
	});
});
