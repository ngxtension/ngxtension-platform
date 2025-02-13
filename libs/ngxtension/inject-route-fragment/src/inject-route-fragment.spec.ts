import {
	booleanAttribute,
	Component,
	inject,
	Injector,
	numberAttribute,
	OnInit,
	Signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { injectRouteFragment } from './inject-route-fragment';

describe(injectRouteFragment.name, () => {
	let harness: RouterTestingHarness;

	beforeEach(async () => {
		TestBed.configureTestingModule({
			providers: [
				provideRouter([
					{
						path: 'test',
						component: TestComponent,
					},
				]),
			],
		});

		harness = await RouterTestingHarness.create();
	});

	it('returns a signal everytime the route fragment changed', async () => {
		const instance = await harness.navigateByUrl('test', TestComponent);

		expect(instance.fragment()).toEqual(null);
		expect(instance.fragmentFromCustomInjector).not.toBeNull();
		if (instance.fragmentFromCustomInjector) {
			expect(instance.fragmentFromCustomInjector()).toEqual(null);
		}
		expect(instance.isFragmentAvailable()).toEqual(false);

		await harness.navigateByUrl('test#sample-fragment', TestComponent);

		expect(instance.fragment()).toEqual('sample-fragment');
		expect(instance.fragmentFromCustomInjector).not.toBeNull();
		if (instance.fragmentFromCustomInjector) {
			expect(instance.fragmentFromCustomInjector()).toEqual('sample-fragment');
		}
		expect(instance.isFragmentAvailable()).toEqual(true);
	});

	it('returns a signal everytime the route fragment changed with default value', async () => {
		const instance = await harness.navigateByUrl('test', TestComponent);

		expect(instance.fragmentDefaultValue()).toEqual('default-fragment');
		expect(instance.fragmentDefaultValueFromCustomInjector).not.toBeNull();
		if (instance.fragmentDefaultValueFromCustomInjector) {
			expect(instance.fragmentDefaultValueFromCustomInjector()).toEqual(
				'default-fragment',
			);
		}
		expect(instance.numberFragmentDefaultValue()).toEqual(100);

		await harness.navigateByUrl('test#sample-fragment', TestComponent);

		expect(instance.fragmentDefaultValue()).toEqual('sample-fragment');
		expect(instance.fragmentDefaultValueFromCustomInjector).not.toBeNull();
		if (instance.fragmentDefaultValueFromCustomInjector) {
			expect(instance.fragmentDefaultValueFromCustomInjector()).toEqual(
				'sample-fragment',
			);
		}
		expect(instance.numberFragmentDefaultValue()).toEqual(NaN);

		await harness.navigateByUrl('test#100000000', TestComponent);

		expect(instance.numberFragmentDefaultValue()).toEqual(100000000);
	});

	it('returns right signals and values for different transformers', async () => {
		const instance = await harness.navigateByUrl('test', TestComponent);

		expect(instance.fragment()).toEqual(null);
		expect(instance.numberFragment()).toEqual(NaN);
		expect(instance.booleanFragment()).toEqual(false);

		await harness.navigateByUrl('test#sample-fragment', TestComponent);

		expect(instance.fragment()).toEqual('sample-fragment');
		expect(instance.numberFragment()).toEqual(NaN);
		expect(instance.booleanFragment()).toEqual(true);

		await harness.navigateByUrl('test#1234', TestComponent);

		expect(instance.fragment()).toEqual('1234');
		expect(instance.numberFragment()).toEqual(1234);
		expect(instance.booleanFragment()).toEqual(true);

		await harness.navigateByUrl('test#true', TestComponent);

		expect(instance.fragment()).toEqual('true');
		expect(instance.numberFragment()).toEqual(NaN);
		expect(instance.booleanFragment()).toEqual(true);

		await harness.navigateByUrl('test#false', TestComponent);

		expect(instance.fragment()).toEqual('false');
		expect(instance.numberFragment()).toEqual(NaN);
		expect(instance.booleanFragment()).toEqual(false);
	});
});

@Component({
	standalone: true,
	template: ``,
})
export class TestComponent implements OnInit {
	private _injector = inject(Injector);
	fragment = injectRouteFragment();
	numberFragment = injectRouteFragment({ transform: numberAttribute });
	numberFragmentDefaultValue = injectRouteFragment({
		transform: numberAttribute,
		defaultValue: 100,
	});
	booleanFragment = injectRouteFragment({ transform: booleanAttribute });
	fragmentDefaultValue = injectRouteFragment({
		defaultValue: 'default-fragment',
	});
	isFragmentAvailable = injectRouteFragment({
		transform: (fragment) => !!fragment,
	});
	fragmentFromCustomInjector: Signal<string | null> | null = null;
	fragmentDefaultValueFromCustomInjector: Signal<string | null> | null = null;

	ngOnInit(): void {
		this.fragmentFromCustomInjector = injectRouteFragment({
			injector: this._injector,
		});
		this.fragmentDefaultValueFromCustomInjector = injectRouteFragment({
			defaultValue: 'default-fragment',
			injector: this._injector,
		});
	}
}
