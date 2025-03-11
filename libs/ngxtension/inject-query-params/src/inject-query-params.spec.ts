import {
	Component,
	inject,
	Injector,
	numberAttribute,
	Signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { injectQueryParams } from './inject-query-params';

@Component({
	standalone: true,
	template: ``,
})
export class SearchComponent {
	private _injector = inject(Injector);

	queryParams = injectQueryParams();
	idParam = injectQueryParams('id', { parse: numberAttribute });
	idParamCustomInjector?: Signal<number | null>;
	idParamDefault = injectQueryParams('id', {
		parse: numberAttribute,
		defaultValue: 420,
	});
	idParams = injectQueryParams.array('id', { parse: numberAttribute });
	idParamsCustomInjector?: Signal<number[] | null>;
	idParamsDefault = injectQueryParams.array('id', {
		parse: numberAttribute,
		defaultValue: [420, 69],
	});
	searchParam = injectQueryParams('query');
	searchParamDefault = injectQueryParams('query', { defaultValue: 'React' });
	searchParams = injectQueryParams.array('query');
	searchParamsCustomInjector?: Signal<string[] | null>;
	searchParamsDefault = injectQueryParams.array('query', {
		defaultValue: ['React', 'Vue'],
	});
	paramKeysList = injectQueryParams((params) => Object.keys(params));

	constructor() {
		this.idParamCustomInjector = injectQueryParams('id', {
			parse: numberAttribute,
			injector: this._injector,
		});
		this.idParamsCustomInjector = injectQueryParams.array('id', {
			parse: numberAttribute,
			injector: this._injector,
		});
		this.searchParamsCustomInjector = injectQueryParams.array('query', {
			injector: this._injector,
		});
	}
}

describe(injectQueryParams.name, () => {
	beforeEach(async () => {
		TestBed.configureTestingModule({
			providers: [
				provideRouter([{ path: 'search', component: SearchComponent }]),
			],
		});
	});

	it('returns a signal everytime the query params change based on the param passed to the fn and parse fn', async () => {
		const harness = await RouterTestingHarness.create();

		const instance = await harness.navigateByUrl(
			'/search?query=Angular',
			SearchComponent,
		);

		expect(instance.queryParams()).toEqual({ query: 'Angular' });
		expect(instance.searchParam()).toEqual('Angular');
		expect(instance.searchParamDefault()).toEqual('Angular');
		expect(instance.idParam()).toEqual(null);
		expect(instance.idParamCustomInjector!()).toEqual(null);
		expect(instance.idParamDefault()).toEqual(420);
		expect(instance.paramKeysList()).toEqual(['query']);

		await harness.navigateByUrl('/search?query=IsCool!&id=2');

		expect(instance.queryParams()).toEqual({ query: 'IsCool!', id: '2' });
		expect(instance.idParam()).toEqual(2);
		expect(instance.idParamCustomInjector!()).toEqual(2);
		expect(instance.idParamDefault()).toEqual(2);
		expect(instance.searchParam()).toEqual('IsCool!');
		expect(instance.searchParamDefault()).toEqual('IsCool!');
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
		expect(instance.idParamDefault()).toEqual(NaN);
		expect(instance.paramKeysList()).toEqual(['id']);

		await harness.navigateByUrl('/search?&id=2.2');

		expect(instance.queryParams()).toEqual({ id: '2.2' });
		expect(instance.idParam()).toEqual(2.2);
		expect(instance.idParamDefault()).toEqual(2.2);
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
		expect(instance.searchParamDefault()).toEqual('Angular');
		expect(instance.idParam()).toEqual(null);
		expect(instance.idParamDefault()).toEqual(420);
		expect(instance.paramKeysList()).toEqual(['query']);

		await harness.navigateByUrl('/search', SearchComponent);

		expect(instance.searchParam()).toEqual(null);
		expect(instance.searchParamDefault()).toEqual('React');
	});

	it('returns a signal for numeric query parameters', async () => {
		const harness = await RouterTestingHarness.create();
		const instance = await harness.navigateByUrl(
			'/search?id=42',
			SearchComponent,
		);

		expect(instance.queryParams()).toEqual({ id: '42' });
		expect(instance.idParam()).toEqual(42);
		expect(instance.idParamDefault()).toEqual(42);
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
		expect(instance.searchParamDefault()).toEqual('Hello World');
		expect(instance.paramKeysList()).toEqual(['query']);
	});

	it('returns a signal for query parameters with no parse', async () => {
		const harness = await RouterTestingHarness.create();
		const instance = await harness.navigateByUrl(
			'/search?query=Angular',
			SearchComponent,
		);

		expect(instance.queryParams()).toEqual({ query: 'Angular' });
		expect(instance.searchParam()).toEqual('Angular');
		expect(instance.searchParamDefault()).toEqual('Angular');
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

	it('returns a signal everytime the query params change based on the param passed to the fn and parse fn', async () => {
		const harness = await RouterTestingHarness.create();

		const instance = await harness.navigateByUrl(
			'/search?query=Angular&query=Analog',
			SearchComponent,
		);

		expect(instance.queryParams()).toEqual({ query: ['Angular', 'Analog'] });
		expect(instance.searchParams()).toEqual(['Angular', 'Analog']);
		expect(instance.searchParamsCustomInjector!()).toEqual([
			'Angular',
			'Analog',
		]);
		expect(instance.searchParamsDefault()).toEqual(['Angular', 'Analog']);
		expect(instance.idParams()).toEqual(null);
		expect(instance.idParamsDefault()).toEqual([420, 69]);
		expect(instance.paramKeysList()).toEqual(['query']);

		await harness.navigateByUrl('/search?query=IsCool!&query=IsNotCool&id=2');

		expect(instance.queryParams()).toEqual({
			query: ['IsCool!', 'IsNotCool'],
			id: '2',
		});
		expect(instance.idParams()).toEqual([2]);
		expect(instance.idParamsCustomInjector!()).toEqual([2]);
		expect(instance.idParamsDefault()).toEqual([2]);
		expect(instance.searchParams()).toEqual(['IsCool!', 'IsNotCool']);
		expect(instance.searchParamsCustomInjector!()).toEqual([
			'IsCool!',
			'IsNotCool',
		]);
		expect(instance.searchParamsDefault()).toEqual(['IsCool!', 'IsNotCool']);
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
		expect(instance.idParamsDefault()).toEqual([NaN, NaN]);
		expect(instance.paramKeysList()).toEqual(['id']);

		await harness.navigateByUrl('/search?&id=2.2&id=5');

		expect(instance.queryParams()).toEqual({ id: ['2.2', '5'] });
		expect(instance.idParams()).toEqual([2.2, 5]);
		expect(instance.idParamsCustomInjector!()).toEqual([2.2, 5]);
		expect(instance.idParamsDefault()).toEqual([2.2, 5]);
		expect(instance.paramKeysList()).toEqual(['id']);
	});

	it('returns a signal for empty query params', async () => {
		const harness = await RouterTestingHarness.create();
		const instance = await harness.navigateByUrl('/search', SearchComponent);

		expect(instance.queryParams()).toEqual({});
		expect(instance.searchParam()).toEqual(null);
		expect(instance.searchParamDefault()).toEqual('React');
		expect(instance.idParam()).toEqual(null);
		expect(instance.idParamDefault()).toEqual(420);
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

	it('returns a signal for array query parameters with no parse', async () => {
		const harness = await RouterTestingHarness.create();
		const instance = await harness.navigateByUrl(
			'/search?query=Angular&query=React',
			SearchComponent,
		);

		expect(instance.queryParams()).toEqual({ query: ['Angular', 'React'] });
		expect(instance.searchParams()).toEqual(['Angular', 'React']);
	});
});
