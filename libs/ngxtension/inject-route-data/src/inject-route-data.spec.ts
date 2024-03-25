import { Component } from '@angular/core';
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

		expect(instance.routeData()).toEqual({ details: 'Entity 1 details' });
		expect(instance.entityDetails()).toEqual('Entity 1 details');
		expect(instance.routeDataKeys()).toEqual(['details']);
		expect(instance.emptyRouteData()).toEqual(null);

		await harness.navigateByUrl(
			'entity/entity-2/details',
			EntityDetailsComponent,
		);

		expect(instance.routeData()).toEqual({ details: 'Entity 2 details' });
		expect(instance.entityDetails()).toEqual('Entity 2 details');
		expect(instance.routeDataKeys()).toEqual(['details']);
		expect(instance.emptyRouteData()).toEqual(null);

		// await harness.navigateByUrl('/search?query=IsCool!&id=2');
		//
		// expect(instance.queryParams()).toEqual({ query: 'IsCool!', id: '2' });
		// expect(instance.searchParam()).toEqual('IsCool!');
		// expect(instance.paramKeysList()).toEqual(['query', 'id']);
	});
});

@Component({
	standalone: true,
	template: ``,
})
export class EntityDetailsComponent {
	routeData = injectRouteData();
	entityDetails = injectRouteData('details');
	routeDataKeys = injectRouteData((data) => Object.keys(data));
	emptyRouteData = injectRouteData('empty');
}
