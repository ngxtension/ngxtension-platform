import { Component, inject, Injector, Signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
	ActivatedRouteSnapshot,
	provideRouter,
	RouterOutlet,
} from '@angular/router';
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
	describe('basic version', () => {
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
			expect(instance.entityDetailsCustomInjector()).toEqual(
				'Entity 1 details',
			);
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
			expect(instance.entityDetailsCustomInjector()).toEqual(
				'Entity 2 details',
			);
			expect(instance.emptyRouteData()).toEqual(null);
			expect(instance.conditionalEmptyWithDefaultRouteData()).toEqual(
				'Entity 2 details',
			);
			expect(
				instance.conditionalEmptyWithDefaultRouteDataCustomInjector(),
			).toEqual('Entity 2 details');
		});

		it('should handle missing route data with default values', async () => {
			TestBed.configureTestingModule({
				providers: [
					provideRouter([
						{
							path: 'user',
							component: DefaultValueComponent,
							data: { title: 'User Page' },
						},
					]),
				],
			});

			const harness = await RouterTestingHarness.create();
			const instance = await harness.navigateByUrl(
				'user',
				DefaultValueComponent,
			);

			// Missing data should return null
			expect(instance.missingData()).toEqual(null);
			// Missing data with default should return default
			expect(instance.missingDataWithDefault()).toEqual('Default Subtitle');
		});

		it('should handle routes without any data', async () => {
			TestBed.configureTestingModule({
				providers: [
					provideRouter([
						{
							path: 'empty',
							component: EmptyDataComponent,
							data: {},
						},
					]),
				],
			});

			const harness = await RouterTestingHarness.create();
			const instance = await harness.navigateByUrl('empty', EmptyDataComponent);

			expect(instance.data()).toEqual({});
			expect(instance.title()).toEqual(null);
		});

		it('should handle multiple data properties', async () => {
			TestBed.configureTestingModule({
				providers: [
					provideRouter([
						{
							path: 'page',
							component: MultipleDataComponent,
							data: {
								title: 'Page Title',
								description: 'Page Description',
								tags: ['tag1', 'tag2'],
							},
						},
					]),
				],
			});

			const harness = await RouterTestingHarness.create();
			const instance = await harness.navigateByUrl(
				'page',
				MultipleDataComponent,
			);

			expect(instance.title()).toEqual('Page Title');
			expect(instance.description()).toEqual('Page Description');
			expect(instance.tags()).toEqual(['tag1', 'tag2']);
		});

		it('should work with transform function returning different types', async () => {
			TestBed.configureTestingModule({
				providers: [
					provideRouter([
						{
							path: 'transform',
							component: TransformDataComponent,
							data: {
								count: 42,
								enabled: true,
								name: 'Test',
							},
						},
					]),
				],
			});

			const harness = await RouterTestingHarness.create();
			const instance = await harness.navigateByUrl(
				'transform',
				TransformDataComponent,
			);

			expect(instance.count()).toEqual(42);
			expect(instance.enabled()).toEqual(true);
			expect(instance.name()).toEqual('Test');
		});

		it('should handle complex data structures', async () => {
			TestBed.configureTestingModule({
				providers: [
					provideRouter([
						{
							path: 'complex',
							component: ComplexDataComponent,
							data: {
								user: {
									id: 123,
									name: 'John Doe',
									roles: ['admin', 'editor'],
								},
								metadata: {
									createdAt: '2023-01-01',
									updatedAt: '2023-01-02',
								},
							},
						},
					]),
				],
			});

			const harness = await RouterTestingHarness.create();
			const instance = await harness.navigateByUrl(
				'complex',
				ComplexDataComponent,
			);

			expect(instance.user()).toEqual({
				id: 123,
				name: 'John Doe',
				roles: ['admin', 'editor'],
			});
			expect(instance.userName()).toEqual('John Doe');
			expect(instance.roleCount()).toEqual(2);
		});
	});

	describe('global option', () => {
		it('should handle deeply nested routes with global', async () => {
			TestBed.configureTestingModule({
				providers: [
					provideRouter([
						{
							path: 'level1',
							component: Level1DataComponent,
							data: { level: 'level1', title: 'Level 1' },
							children: [
								{
									path: 'level2',
									component: Level2DataComponent,
									data: { level: 'level2', subtitle: 'Level 2' },
									children: [
										{
											path: 'level3',
											component: Level3DataComponent,
											data: { level: 'level3', description: 'Level 3' },
										},
									],
								},
							],
						},
					]),
				],
			});

			const harness = await RouterTestingHarness.create();
			const instance = await harness.navigateByUrl(
				'level1/level2/level3',
				Level1DataComponent,
			);

			const allData = instance.allData();
			expect(allData).toEqual({
				level: 'level3',
				title: 'Level 1',
				subtitle: 'Level 2',
				description: 'Level 3',
			});
			expect(instance.level()).toEqual('level3');
		});

		it('should handle data name conflicts with global (child should override)', async () => {
			TestBed.configureTestingModule({
				providers: [
					provideRouter([
						{
							path: 'conflict-parent',
							component: ConflictDataParentComponent,
							data: { title: 'Parent Title', parentOnly: 'Parent Data' },
							children: [
								{
									path: 'conflict-child',
									component: ConflictDataChildComponent,
									data: { title: 'Child Title', childOnly: 'Child Data' },
								},
							],
						},
					]),
				],
			});

			const harness = await RouterTestingHarness.create();
			const instance = await harness.navigateByUrl(
				'conflict-parent/conflict-child',
				ConflictDataParentComponent,
			);

			const allData = instance.allData() as Record<string, unknown>;
			expect(allData['title']).toEqual('Child Title');
			expect(allData['parentOnly']).toEqual('Parent Data');
			expect(allData['childOnly']).toEqual('Child Data');
		});

		it('should handle missing data in child routes with global', async () => {
			TestBed.configureTestingModule({
				providers: [
					provideRouter([
						{
							path: 'parent',
							component: MissingDataParentComponent,
							data: { parentData: 'Parent Value' },
							children: [
								{
									path: 'child',
									component: MissingDataChildComponent,
									data: {},
								},
							],
						},
					]),
				],
			});

			const harness = await RouterTestingHarness.create();
			const instance = await harness.navigateByUrl(
				'parent/child',
				MissingDataParentComponent,
			);

			const allData = instance.allData() as Record<string, unknown>;
			expect(allData['parentData']).toEqual('Parent Value');
			expect(instance.childData()).toEqual(null);
			expect(instance.childDataWithDefault()).toEqual('Default Child Data');
		});

		it('should work with no data in route hierarchy with global', async () => {
			TestBed.configureTestingModule({
				providers: [
					provideRouter([
						{
							path: 'empty-parent',
							component: EmptyDataParentComponent,
							children: [
								{
									path: 'empty-child',
									component: EmptyDataChildGlobalComponent,
								},
							],
						},
					]),
				],
			});

			const harness = await RouterTestingHarness.create();
			const instance = await harness.navigateByUrl(
				'empty-parent/empty-child',
				EmptyDataParentComponent,
			);

			expect(instance.allData()).toEqual({});
			expect(instance.title()).toEqual(null);
		});

		it('should update reactively when child route data changes with global', async () => {
			TestBed.configureTestingModule({
				providers: [
					provideRouter([
						{
							path: 'reactive',
							component: ReactiveDataParentComponent,
							data: { section: 'main' },
							children: [
								{
									path: 'child1',
									component: ReactiveDataChildComponent,
									data: { page: 'child1', content: 'Content 1' },
								},
								{
									path: 'child2',
									component: ReactiveDataChildComponent,
									data: { page: 'child2', content: 'Content 2' },
								},
							],
						},
					]),
				],
			});

			const harness = await RouterTestingHarness.create();
			const instance = await harness.navigateByUrl(
				'reactive/child1',
				ReactiveDataParentComponent,
			);

			expect(instance.page()).toEqual('child1');
			expect(instance.content()).toEqual('Content 1');

			await harness.navigateByUrl('reactive/child2');

			expect(instance.page()).toEqual('child2');
			expect(instance.content()).toEqual('Content 2');
		});

		it('should work with global and transform returning complex types', async () => {
			TestBed.configureTestingModule({
				providers: [
					provideRouter([
						{
							path: 'complex-parent',
							component: ComplexTransformParentComponent,
							data: { parentKey: 'parentValue' },
							children: [
								{
									path: 'complex-child',
									component: ComplexTransformChildComponent,
									data: { childKey: 'childValue', count: 5 },
								},
							],
						},
					]),
				],
			});

			const harness = await RouterTestingHarness.create();
			const instance = await harness.navigateByUrl(
				'complex-parent/complex-child',
				ComplexTransformParentComponent,
			);

			expect(instance.dataCount()).toEqual(3);
		});
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

// Basic version test components
@Component({
	standalone: true,
	template: ``,
})
export class DefaultValueComponent {
	missingData = injectRouteData('subtitle');
	missingDataWithDefault = injectRouteData('subtitle', {
		defaultValue: 'Default Subtitle',
	});
}

@Component({
	standalone: true,
	template: ``,
})
export class EmptyDataComponent {
	data = injectRouteData();
	title = injectRouteData('title');
}

@Component({
	standalone: true,
	template: ``,
})
export class MultipleDataComponent {
	title = injectRouteData('title');
	description = injectRouteData('description');
	tags = injectRouteData('tags');
}

@Component({
	standalone: true,
	template: ``,
})
export class TransformDataComponent {
	count = injectRouteData((data) => data['count'] as number);
	enabled = injectRouteData((data) => data['enabled'] as boolean);
	name = injectRouteData((data) => data['name'] as string);
}

@Component({
	standalone: true,
	template: ``,
})
export class ComplexDataComponent {
	user = injectRouteData('user');
	userName = injectRouteData((data) => (data['user'] as { name: string }).name);
	roleCount = injectRouteData(
		(data) => (data['user'] as { roles: string[] }).roles.length,
	);
}

// Global option test components
@Component({
	standalone: true,
	template: `
		<router-outlet />
	`,
	imports: [RouterOutlet],
})
export class Level1DataComponent {
	allData = injectRouteData.global();
	level = injectRouteData.global('level');
}

@Component({
	standalone: true,
	template: `
		<router-outlet />
	`,
	imports: [RouterOutlet],
})
export class Level2DataComponent {}

@Component({
	standalone: true,
	template: ``,
})
export class Level3DataComponent {}

@Component({
	standalone: true,
	template: `
		<router-outlet />
	`,
	imports: [RouterOutlet],
})
export class ConflictDataParentComponent {
	allData = injectRouteData.global();
}

@Component({
	standalone: true,
	template: ``,
})
export class ConflictDataChildComponent {}

@Component({
	standalone: true,
	template: `
		<router-outlet />
	`,
	imports: [RouterOutlet],
})
export class MissingDataParentComponent {
	allData = injectRouteData.global();
	childData = injectRouteData.global('childData');
	childDataWithDefault = injectRouteData.global('childData', {
		defaultValue: 'Default Child Data',
	});
}

@Component({
	standalone: true,
	template: ``,
})
export class MissingDataChildComponent {}

@Component({
	standalone: true,
	template: `
		<router-outlet />
	`,
	imports: [RouterOutlet],
})
export class EmptyDataParentComponent {
	allData = injectRouteData.global();
	title = injectRouteData.global('title');
}

@Component({
	standalone: true,
	template: ``,
})
export class EmptyDataChildGlobalComponent {}

@Component({
	standalone: true,
	template: `
		<router-outlet />
	`,
	imports: [RouterOutlet],
})
export class ReactiveDataParentComponent {
	page = injectRouteData.global('page');
	content = injectRouteData.global('content');
}

@Component({
	standalone: true,
	template: ``,
})
export class ReactiveDataChildComponent {}

@Component({
	standalone: true,
	template: `
		<router-outlet />
	`,
	imports: [RouterOutlet],
})
export class ComplexTransformParentComponent {
	dataCount = injectRouteData.global((data) => Object.keys(data).length);
}

@Component({
	standalone: true,
	template: ``,
})
export class ComplexTransformChildComponent {}
