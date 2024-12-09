import {
	Component,
	inject,
	Injector,
	numberAttribute,
	OnInit,
	signal,
	WritableSignal,
} from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { ActivatedRoute, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import {
	linkedQueryParam,
	paramToBoolean,
	paramToNumber,
} from './linked-query-param';

interface MyParams {
	a: string;
	b: number;
	c: boolean;
	d: {
		e: string;
		f: number;
		g: boolean;
	};
}

@Component({ standalone: true, template: `` })
export class SearchComponent {
	route = inject(ActivatedRoute);

	defaultBehavior = linkedQueryParam('defaultBehavior'); // WritableSignal<string | null>
	defaultBehaviorWithDefault = linkedQueryParam('defaultBehaviorWithDefault', {
		defaultValue: 'default',
	}); // WritableSignal<string>

	parseBehavior = linkedQueryParam('parseBehavior', {
		parse: (x: string | null) => parseInt(x ?? '0', 10),
	}); // WritableSignal<number>

	parseBehavior1 = linkedQueryParam('parseBehavior', {
		parse: (x: string | null) => (x ? parseInt(x, 10) : x),
	}); // WritableSignal<number | string | null>

	parseBehaviorWithParseAndNumberAttribute = linkedQueryParam(
		'parseBehaviorWithParseAndNumberAttribute',
		{ parse: numberAttribute },
	); // WritableSignal<number>

	withBooleanParams = linkedQueryParam('withBooleanParams', {
		parse: (x) => x === 'true',
		stringify: (x) => (x ? 'true' : 'false'),
	}); // WritableSignal<boolean>

	withBuiltInBooleanParamNoDefault = linkedQueryParam('withBooleanNoDefault', {
		parse: paramToBoolean(),
	}); // WritableSignal<boolean | null>

	withBuiltInBooleanParamWithDefault = linkedQueryParam(
		'withBooleanWithDefault',
		{
			parse: paramToBoolean({ defaultValue: true }),
		},
	); // WritableSignal<boolean>

	withNumberParams = linkedQueryParam('withNumberParams', {
		parse: (x: string | null) => {
			if (x !== null) {
				const parsed = parseInt(x, 10);
				if (isNaN(parsed)) return null;
				return parsed;
			}
			return x;
		},
		stringify: (x) => x,
	}); // WritableSignal<number | null>

	withBuiltInNumberParamNoDefault = linkedQueryParam('withNumberNoDefault', {
		parse: paramToNumber(),
	}); // WritableSignal<number | null>

	withBuiltInNumberParamWithDefault = linkedQueryParam(
		'withNumberWithDefault',
		{
			parse: paramToNumber({ defaultValue: 1 }),
		},
	); // WritableSignal<number>

	withObjectParams = linkedQueryParam<MyParams>('withObjectParams', {
		parse: (x: string | null) => (x ? JSON.parse(x) : x),
		stringify: (x) => JSON.stringify(x),
	}); // WritableSignal<MyParams | null>

	stringifyBehavior = linkedQueryParam('stringifyBehavior', {
		stringify: (x) => x?.toUpperCase() ?? null,
	}); // WritableSignal<string | null>

	transformBehaviorWithDefault = linkedQueryParam(
		'transformBehaviorWithDefault',
		{
			stringify: (x: string | null) => x?.toUpperCase() ?? null,
			defaultValue: 'default',
		},
	);
}

describe(linkedQueryParam.name, () => {
	beforeEach(async () => {
		TestBed.configureTestingModule({
			providers: [
				provideRouter([
					{ path: 'search', component: SearchComponent },
					{
						path: 'with-default-and-parse',
						component: WithDefaultAndParseComponent,
					},
					{ path: 'with-injector-in-oninit', component: WithInjectorInOnInit },
				]),
			],
		});
	});

	it('should create a signal linked to a query param', async () => {
		const harness = await RouterTestingHarness.create();
		const instance = await harness.navigateByUrl('/search', SearchComponent);

		expect(instance.defaultBehavior()).toBe(null);
		expect(instance.defaultBehaviorWithDefault()).toBe('default');

		await harness.navigateByUrl('/search?defaultBehavior=value');
		TestBed.flushEffects();
		expect(instance.defaultBehavior()).toBe('value');

		await harness.navigateByUrl('/search?defaultBehaviorWithDefault=value');
		expect(instance.defaultBehaviorWithDefault()).toBe('value');

		await harness.navigateByUrl('/search?defaultBehaviorWithDefault');
		expect(instance.defaultBehaviorWithDefault()).toBe('');
	});

	it('should parse the query param value', fakeAsync(async () => {
		const harness = await RouterTestingHarness.create();
		const instance = await harness.navigateByUrl(
			'/search?parseBehavior=1',
			SearchComponent,
		);
		expect(instance.parseBehavior()).toBe(1);

		await harness.navigateByUrl('/search?parseBehavior=2');
		expect(instance.parseBehavior()).toBe(2);

		// update the value directly on the signal and it will be updated in the query param
		instance.parseBehavior.set(3);
		// it's synchronous here because we set the value directly on the signal
		expect(instance.parseBehavior()).toBe(3);

		tick();
		expect(instance.route.snapshot.queryParams['parseBehavior']).toBe('3');

		instance.parseBehavior.set(4);
		expect(instance.parseBehavior()).toBe(4);

		tick();
		expect(instance.route.snapshot.queryParams['parseBehavior']).toBe('4');
	}));

	it('should parse with numberAttribute', fakeAsync(async () => {
		const harness = await RouterTestingHarness.create();
		const instance = await harness.navigateByUrl(
			'/search?parseBehaviorWithParseAndNumberAttribute=1',
			SearchComponent,
		);
		expect(instance.parseBehaviorWithParseAndNumberAttribute()).toBe(1);
		await harness.navigateByUrl(
			'/search?parseBehaviorWithParseAndNumberAttribute=2',
		);
		expect(instance.parseBehaviorWithParseAndNumberAttribute()).toBe(2);
	}));

	it('should throw error when using both parse and the default value', fakeAsync(async () => {
		const harness = await RouterTestingHarness.create();
		try {
			await harness.navigateByUrl(
				'/with-default-and-parse',
				WithDefaultAndParseComponent,
			);
			expect('this should not be reached').toBe(true);
		} catch (e: any) {
			expect(e.message).toBe(
				'linkedQueryParam: You cannot have both defaultValue and parse at the same time!',
			);
		}
	}));

	it('should transform the value we set on the signal', fakeAsync(async () => {
		const harness = await RouterTestingHarness.create();
		const instance = await harness.navigateByUrl(
			'/search?stringifyBehavior=value',
			SearchComponent,
		);
		expect(instance.stringifyBehavior()).toBe('value');

		TestBed.flushEffects();
		expect(instance.route.snapshot.queryParams['stringifyBehavior']).toBe(
			'value',
		);

		instance.stringifyBehavior.set('value2');
		expect(instance.stringifyBehavior()).toBe('value2');
		tick();
		expect(instance.route.snapshot.queryParams['stringifyBehavior']).toBe(
			'VALUE2',
		);

		instance.stringifyBehavior.set('value3');
		expect(instance.stringifyBehavior()).toBe('value3');
		tick();
		expect(instance.route.snapshot.queryParams['stringifyBehavior']).toBe(
			'VALUE3',
		);

		instance.stringifyBehavior.set(null);
		expect(instance.stringifyBehavior()).toBe(null);
		tick();
		expect(instance.route.snapshot.queryParams['stringifyBehavior']).toBe(
			undefined,
		);
	}));

	it('should coalesce multiple set calls and only update the query param once', fakeAsync(async () => {
		const harness = await RouterTestingHarness.create();
		const instance = await harness.navigateByUrl('/search', SearchComponent);

		instance.defaultBehavior.set('value');
		expect(instance.defaultBehavior()).toBe('value');
		// no tick here yet
		expect(instance.route.snapshot.queryParams['defaultBehavior']).toBe(
			undefined,
		);
		expect(instance.route.snapshot.queryParams['defaultBehavior']).not.toBe(
			'value',
		);

		// no tick here yet
		instance.defaultBehavior.set('value2');
		expect(instance.defaultBehavior()).toBe('value2');

		expect(instance.route.snapshot.queryParams['defaultBehavior']).toBe(
			undefined,
		);

		tick();

		expect(instance.route.snapshot.queryParams['defaultBehavior']).toBe(
			'value2',
		);
	}));

	it('should handle null values', fakeAsync(async () => {
		const harness = await RouterTestingHarness.create();
		const instance = await harness.navigateByUrl('/search', SearchComponent);

		instance.defaultBehavior.set(null);
		expect(instance.defaultBehavior()).toBe(null);

		tick();
		expect(instance.route.snapshot.queryParams['defaultBehavior']).toBe(
			undefined,
		);

		await harness.navigateByUrl('/search?defaultBehaviorWithDefault=value1');
		expect(instance.defaultBehaviorWithDefault()).toBe('value1');

		instance.defaultBehaviorWithDefault.set(null);

		expect(instance.defaultBehaviorWithDefault()).toBe(null);

		tick();
		expect(
			instance.route.snapshot.queryParams['defaultBehaviorWithDefault'],
		).toBe(undefined);
	}));

	it('should handle boolean values', fakeAsync(async () => {
		const harness = await RouterTestingHarness.create();
		const instance = await harness.navigateByUrl('/search', SearchComponent);

		expect(instance.withBooleanParams()).toBe(false);

		instance.withBooleanParams.set(true);
		tick();
		expect(instance.withBooleanParams()).toBe(true);
		expect(instance.route.snapshot.queryParams['withBooleanParams']).toBe(
			'true',
		);

		instance.withBooleanParams.set(false);
		tick();
		expect(instance.withBooleanParams()).toBe(false);
		expect(instance.route.snapshot.queryParams['withBooleanParams']).toBe(
			'false',
		);

		instance.withBooleanParams.set(null);
		tick();
		expect(instance.withBooleanParams()).toBe(null);
		expect(instance.route.snapshot.queryParams['withBooleanParams']).toBe(
			'false',
		);
	}));

	it('should handle built-in boolean parser with no default', fakeAsync(async () => {
		const harness = await RouterTestingHarness.create();
		const instance = await harness.navigateByUrl('/search', SearchComponent);

		expect(instance.withBuiltInBooleanParamNoDefault()).toBe(null);

		instance.withBuiltInBooleanParamNoDefault.set(true);
		tick();
		expect(instance.withBuiltInBooleanParamNoDefault()).toBe(true);
		expect(instance.route.snapshot.queryParams['withBooleanNoDefault']).toBe(
			'true',
		);

		instance.withBuiltInBooleanParamNoDefault.set(false);
		tick();
		expect(instance.withBuiltInBooleanParamNoDefault()).toBe(false);
		expect(instance.route.snapshot.queryParams['withBooleanNoDefault']).toBe(
			'false',
		);

		instance.withBuiltInBooleanParamNoDefault.set(null);
		tick();
		expect(instance.withBuiltInBooleanParamNoDefault()).toBe(null);
		expect(instance.route.snapshot.queryParams['withBooleanNoDefault']).toBe(
			undefined,
		);
	}));

	it('should handle built-in boolean parser with default', fakeAsync(async () => {
		const harness = await RouterTestingHarness.create();
		const instance = await harness.navigateByUrl('/search', SearchComponent);

		expect(instance.withBuiltInBooleanParamWithDefault()).toBe(true);
		expect(instance.route.snapshot.queryParams['withBooleanWithDefault']).toBe(
			undefined,
		);

		instance.withBuiltInBooleanParamWithDefault.set(true);
		tick();
		expect(instance.withBuiltInBooleanParamWithDefault()).toBe(true);
		expect(instance.route.snapshot.queryParams['withBooleanWithDefault']).toBe(
			'true',
		);

		instance.withBuiltInBooleanParamWithDefault.set(false);
		tick();
		expect(instance.withBuiltInBooleanParamWithDefault()).toBe(false);
		expect(instance.route.snapshot.queryParams['withBooleanWithDefault']).toBe(
			'false',
		);

		instance.withBuiltInBooleanParamWithDefault.set(null);
		tick();
		expect(instance.withBuiltInBooleanParamWithDefault()).toBe(true);
		expect(instance.route.snapshot.queryParams['withBooleanWithDefault']).toBe(
			undefined,
		);
	}));

	it('should handle number values', fakeAsync(async () => {
		const harness = await RouterTestingHarness.create();
		const instance = await harness.navigateByUrl('/search', SearchComponent);

		expect(instance.withNumberParams()).toBe(null);

		instance.withNumberParams.set(1);
		tick();
		expect(instance.withNumberParams()).toBe(1);
		expect(instance.route.snapshot.queryParams['withNumberParams']).toBe('1');

		instance.withNumberParams.set(null);
		tick();
		expect(instance.withNumberParams()).toBe(null);
		expect(instance.route.snapshot.queryParams['withNumberParams']).toBe(
			undefined,
		);
	}));

	it('should handle built-in number parser with no default', fakeAsync(async () => {
		const harness = await RouterTestingHarness.create();
		const instance = await harness.navigateByUrl('/search', SearchComponent);

		expect(instance.withBuiltInNumberParamNoDefault()).toBe(null);
		expect(instance.route.snapshot.queryParams['withNumberNoDefault']).toBe(
			undefined,
		);

		instance.withBuiltInNumberParamNoDefault.set(1);
		tick();
		expect(instance.withBuiltInNumberParamNoDefault()).toBe(1);
		expect(instance.route.snapshot.queryParams['withNumberNoDefault']).toBe(
			'1',
		);

		instance.withBuiltInNumberParamNoDefault.set(2);
		tick();
		expect(instance.withBuiltInNumberParamNoDefault()).toBe(2);
		expect(instance.route.snapshot.queryParams['withNumberNoDefault']).toBe(
			'2',
		);

		instance.withBuiltInNumberParamNoDefault.set(null);
		tick();
		expect(instance.withBuiltInNumberParamNoDefault()).toBe(null);
		expect(instance.route.snapshot.queryParams['withNumberNoDefault']).toBe(
			undefined,
		);
	}));

	it('should handle built-in number parser with default', fakeAsync(async () => {
		const harness = await RouterTestingHarness.create();
		const instance = await harness.navigateByUrl('/search', SearchComponent);

		expect(instance.withBuiltInNumberParamWithDefault()).toBe(1);
		expect(instance.route.snapshot.queryParams['withNumberWithDefault']).toBe(
			undefined,
		);

		instance.withBuiltInNumberParamWithDefault.set(1);
		tick();
		expect(instance.withBuiltInNumberParamWithDefault()).toBe(1);
		expect(instance.route.snapshot.queryParams['withNumberWithDefault']).toBe(
			'1',
		);

		instance.withBuiltInNumberParamWithDefault.set(2);
		tick();
		expect(instance.withBuiltInNumberParamWithDefault()).toBe(2);
		expect(instance.route.snapshot.queryParams['withNumberWithDefault']).toBe(
			'2',
		);

		instance.withBuiltInNumberParamWithDefault.set(null);
		tick();
		expect(instance.withBuiltInNumberParamWithDefault()).toBe(1);
		expect(instance.route.snapshot.queryParams['withNumberWithDefault']).toBe(
			undefined,
		);
	}));

	it('should work with injector in ngOnInit', fakeAsync(async () => {
		const harness = await RouterTestingHarness.create();
		const instance = await harness.navigateByUrl(
			'/with-injector-in-oninit',
			WithInjectorInOnInit,
		);

		instance.ngOnInit();
		tick();

		expect(instance.param()).toBe(null);
		expect(instance.route.snapshot.queryParams['testParamInit']).toBe(
			undefined,
		);

		instance.param.set('1');
		tick();
		expect(instance.param()).toBe('1');
		expect(instance.route.snapshot.queryParams['testParamInit']).toBe('1');

		instance.param.set(null);
		tick();
		expect(instance.param()).toBe(null);
		expect(instance.route.snapshot.queryParams['testParamInit']).toBe(
			undefined,
		);
	}));
});

@Component({ standalone: true, template: `` })
export class WithInjectorInOnInit implements OnInit {
	private injector = inject(Injector);
	route = inject(ActivatedRoute);

	param!: WritableSignal<string | null>;

	ngOnInit() {
		this.param = linkedQueryParam('testParamInit', { injector: this.injector });
	}
}

@Component({ standalone: true, template: `` })
export class WithDefaultAndParseComponent {
	route = inject(ActivatedRoute);
	parseBehaviorWithDefault = linkedQueryParam('parseBehaviorWithDefault', {
		parse: (x: any) => (x ? parseInt(x, 10) : x),
		defaultValue: 1,
	}); // never

	testTypes() {
		// @ts-expect-error Type 'never' is not assignable to type 'WritableSignal<number>'.
		this.parseBehaviorWithDefault = signal(1);
	}
}
