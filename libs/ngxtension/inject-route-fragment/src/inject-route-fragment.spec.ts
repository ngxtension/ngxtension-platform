import { Component, inject, Injector, OnInit, Signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { injectRouteFragment } from './inject-route-fragment';

describe(injectRouteFragment.name, () => {
	it('returns a signal everytime the route fragment changed', async () => {
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

		const harness = await RouterTestingHarness.create();

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
});

@Component({
	standalone: true,
	template: ``,
})
export class TestComponent implements OnInit {
	private _injector = inject(Injector);
	fragment = injectRouteFragment();
	isFragmentAvailable = injectRouteFragment({
		transform: (fragment) => !!fragment,
	});
	fragmentFromCustomInjector: Signal<string | null> | null = null;

	ngOnInit() {
		this.fragmentFromCustomInjector = injectRouteFragment({
			injector: this._injector,
		});
	}
}
