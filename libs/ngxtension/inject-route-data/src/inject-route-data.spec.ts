import { Component, inject, Injector, Signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ActivatedRouteSnapshot, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';
import { injectRouteData } from './inject-route-data';

function getEntityDetails(entityId: string) {
	switch (entityId) {
		case 'entity-1':
			return of('Entity 1 details');
		case 'entity-2':
			return of('Entity 2 details');
	}
}

describe(injectRouteData.name, () => {
	it('returns a signal everytime the route data change based on the param passed to the fn', async () => {
		TestBed.configureTestingModule({
			providers: [
				provideRouter([
					{
						path: 'entity/:id/details',
						component: EntityDetailsComponent,
						resolve: {
							details: (route: ActivatedRouteSnapshot) => {
								const id = route.paramMap.get('id')!;
								return getEntityDetails(id);
							},
							conditionalEmpty: (route: ActivatedRouteSnapshot) => {
								const id = route.paramMap.get('id')!;
								return id === 'entity-2' ? getEntityDetails(id) : null;
							},
						},
					},
				]),
			],
		});

		const harness = await RouterTestingHarness.create();

		const instance = await harness.navigateByUrl(
			'entity/entity-1/details',
			EntityDetailsComponent,
		);

		expect(instance.routeData()).toEqual({
			details: 'Entity 1 details',
			conditionalEmpty: null,
		});
		expect(instance.routeDataKeys()).toEqual(['details', 'conditionalEmpty']);
		expect(instance.entityDetails()).toEqual('Entity 1 details');
		expect(instance.entityDetailsCustomInjector()).toEqual('Entity 1 details');
		expect(instance.emptyRouteData()).toEqual(null);
		expect(instance.conditionalEmptyWithDefaultRouteData()).toEqual(
			'Entity default details',
		);
		expect(
			instance.conditionalEmptyWithDefaultRouteDataCustomInjector(),
		).toEqual('Entity default details');

		await harness.navigateByUrl(
			'entity/entity-2/details',
			EntityDetailsComponent,
		);

		expect(instance.routeData()).toEqual({
			details: 'Entity 2 details',
			conditionalEmpty: 'Entity 2 details',
		});
		expect(instance.routeDataKeys()).toEqual(['details', 'conditionalEmpty']);
		expect(instance.entityDetails()).toEqual('Entity 2 details');
		expect(instance.entityDetailsCustomInjector()).toEqual('Entity 2 details');
		expect(instance.emptyRouteData()).toEqual(null);
		expect(instance.conditionalEmptyWithDefaultRouteData()).toEqual(
			'Entity 2 details',
		);
		expect(
			instance.conditionalEmptyWithDefaultRouteDataCustomInjector(),
		).toEqual('Entity 2 details');
	});
});

@Component({
	standalone: true,
	template: ``,
})
export class EntityDetailsComponent {
	private _injector = inject(Injector);

	routeData = injectRouteData();
	entityDetails = injectRouteData('details');
	routeDataKeys = injectRouteData((data) => Object.keys(data));
	emptyRouteData = injectRouteData('empty');
	conditionalEmptyWithDefaultRouteData = injectRouteData('conditionalEmpty', {
		defaultValue: 'Entity default details',
	});

	entityDetailsCustomInjector: Signal<unknown>;
	conditionalEmptyWithDefaultRouteDataCustomInjector: Signal<string | null>;

	constructor() {
		this.entityDetailsCustomInjector = injectRouteData('details', {
			injector: this._injector,
		});
		this.conditionalEmptyWithDefaultRouteDataCustomInjector = injectRouteData(
			'conditionalEmpty',
			{ defaultValue: 'Entity default details', injector: this._injector },
		);
	}
}
