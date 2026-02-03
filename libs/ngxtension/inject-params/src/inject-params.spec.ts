import {
	Component,
	inject,
	Injector,
	numberAttribute,
	Signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { provideRouter, RouterOutlet } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { injectParams } from './inject-params';

describe(injectParams.name, () => {
	it('returns a signal everytime the route params change based on the param passed to the fn', async () => {
		TestBed.configureTestingModule({
			providers: [
				provideRouter([{ path: 'user/:id', component: UserProfileComponent }]),
			],
		});

		const harness = await RouterTestingHarness.create();

		const instance = await harness.navigateByUrl(
			'/user/angular',
			UserProfileComponent,
		);

		expect(instance.params()).toEqual({ id: 'angular' });
		expect(instance.userId()).toEqual('angular');
		expect(instance.userIdCustomInjector?.()).toEqual('angular');
		expect(instance.paramKeysList()).toEqual(['id']);

		await harness.navigateByUrl('/user/test', UserProfileComponent);

		expect(instance.params()).toEqual({ id: 'test' });
		expect(instance.userId()).toEqual('test');
		expect(instance.userIdCustomInjector?.()).toEqual('test');
		expect(instance.paramKeysList()).toEqual(['id']);
	});

	it('returns a signal everytime the route params change based on the param id and transform option', async () => {
		TestBed.configureTestingModule({
			providers: [
				provideRouter([
					{ path: 'post/:id', component: PostComponent },
					{ path: 'post', component: PostComponent },
				]),
			],
		});

		const harness = await RouterTestingHarness.create();

		const instanceNull = await harness.navigateByUrl('/post', PostComponent);

		expect(instanceNull.postId()).toEqual(null);
		expect(instanceNull.postIdDefault()).toEqual(69);

		const instance = await harness.navigateByUrl('/post/420', PostComponent);

		expect(instance.postId()).toEqual(420);
		expect(instance.postIdDefault()).toEqual(420);

		await harness.navigateByUrl('/post/test', PostComponent);

		expect(instance.postId()).toEqual(NaN);
		expect(instance.postIdDefault()).toEqual(NaN);
	});

	it('should handle missing params with default values', async () => {
		TestBed.configureTestingModule({
			providers: [
				provideRouter([{ path: 'page', component: DefaultValueComponent }]),
			],
		});

		const harness = await RouterTestingHarness.create();
		const instance = await harness.navigateByUrl(
			'/page',
			DefaultValueComponent,
		);

		expect(instance.missingParam()).toEqual(null);
		expect(instance.missingParamWithDefault()).toEqual('default-value');
	});

	it('should handle routes without all required params', async () => {
		TestBed.configureTestingModule({
			providers: [
				provideRouter([
					{ path: 'search', component: SearchComponent },
					{ path: 'search/:query', component: SearchComponent },
				]),
			],
		});

		const harness = await RouterTestingHarness.create();
		const instance = await harness.navigateByUrl('/search', SearchComponent);

		// Missing optional param should return null
		expect(instance.query()).toEqual(null);
	});

	it('should handle multiple params', async () => {
		TestBed.configureTestingModule({
			providers: [
				provideRouter([
					{
						path: 'article/:category/:id',
						component: ArticleComponent,
					},
				]),
			],
		});

		const harness = await RouterTestingHarness.create();
		const instance = await harness.navigateByUrl(
			'/article/tech/123',
			ArticleComponent,
		);

		expect(instance.allParams()).toEqual({ category: 'tech', id: '123' });
		expect(instance.category()).toEqual('tech');
		expect(instance.id()).toEqual('123');
	});

	it('should work with transform function returning different types', async () => {
		TestBed.configureTestingModule({
			providers: [
				provideRouter([
					{ path: 'product/:id/:count', component: TransformComponent },
				]),
			],
		});

		const harness = await RouterTestingHarness.create();
		const instance = await harness.navigateByUrl(
			'/product/laptop/5',
			TransformComponent,
		);

		expect(instance.paramCount()).toEqual(2);
		expect(instance.hasId()).toEqual(true);
		expect(instance.paramsAsString()).toEqual('id=laptop,count=5');
	});

	it('should handle special characters in params', async () => {
		TestBed.configureTestingModule({
			providers: [
				provideRouter([
					{ path: 'user/:name', component: SpecialCharsComponent },
				]),
			],
		});

		const harness = await RouterTestingHarness.create();
		const instance = await harness.navigateByUrl(
			'/user/john%20doe',
			SpecialCharsComponent,
		);

		expect(instance.name()).toEqual('john doe');
	});

	describe('global option', () => {
		it('should get params from current route when global is false', async () => {
			TestBed.configureTestingModule({
				providers: [
					provideRouter([
						{
							path: 'parent/:parentId',
							component: ParentWithGlobalComponent,
							children: [
								{ path: 'child/:childId', component: ChildParamsComponent },
							],
						},
					]),
				],
			});

			const harness = await RouterTestingHarness.create();

			const instance = await harness.navigateByUrl(
				'/parent/123/child/456',
				ParentWithGlobalComponent,
			);

			// Without global option, only gets parent params
			expect(instance.paramsLocal()).toEqual({ parentId: '123' });
			expect(instance.parentIdLocal()).toEqual('123');
		});

		it('should get params from leaf route when global is true', async () => {
			TestBed.configureTestingModule({
				providers: [
					provideRouter([
						{
							path: 'parent/:parentId',
							component: ParentWithGlobalComponent,
							children: [
								{ path: 'child/:childId', component: ChildParamsComponent },
							],
						},
					]),
				],
			});

			const harness = await RouterTestingHarness.create();

			const instance = await harness.navigateByUrl(
				'/parent/123/child/456',
				ParentWithGlobalComponent,
			);

			// With global option, gets all params from leaf route
			expect(instance.paramsGlobal()).toEqual({
				parentId: '123',
				childId: '456',
			});
			expect(instance.childIdGlobal()).toEqual('456');
		});

		it('should update when navigating between child routes with global option', async () => {
			TestBed.configureTestingModule({
				providers: [
					provideRouter([
						{
							path: 'org/:orgId',
							component: OrgWithGlobalComponent,
							children: [
								{ path: 'user/:userId', component: UserGlobalComponent },
								{ path: 'team/:teamId', component: TeamGlobalComponent },
							],
						},
					]),
				],
			});

			const harness = await RouterTestingHarness.create();

			const instance = await harness.navigateByUrl(
				'/org/acme/user/john',
				OrgWithGlobalComponent,
			);

			expect(instance.globalParams()).toEqual({
				orgId: 'acme',
				userId: 'john',
			});

			await harness.navigateByUrl('/org/acme/team/engineering');

			expect(instance.globalParams()).toEqual({
				orgId: 'acme',
				teamId: 'engineering',
			});
		});

		it('should work with transform function and global option', async () => {
			TestBed.configureTestingModule({
				providers: [
					provideRouter([
						{
							path: 'dashboard/:dashId',
							component: DashboardGlobalComponent,
							children: [
								{
									path: 'widget/:widgetId',
									component: WidgetGlobalComponent,
								},
							],
						},
					]),
				],
			});

			const harness = await RouterTestingHarness.create();

			const instance = await harness.navigateByUrl(
				'/dashboard/main/widget/chart',
				DashboardGlobalComponent,
			);

			expect(instance.paramsKeys()).toEqual(['dashId', 'widgetId']);
		});

		it('should work with parse and defaultValue options combined with global', async () => {
			TestBed.configureTestingModule({
				providers: [
					provideRouter([
						{
							path: 'store/:storeId',
							component: StoreGlobalComponent,
							children: [
								{
									path: 'product/:productId',
									component: ProductGlobalComponent,
								},
							],
						},
					]),
				],
			});

			const harness = await RouterTestingHarness.create();

			const instance = await harness.navigateByUrl(
				'/store/1/product/999',
				StoreGlobalComponent,
			);

			expect(instance.productIdGlobal()).toEqual(999);
		});

		it('should handle deeply nested routes with global', async () => {
			TestBed.configureTestingModule({
				providers: [
					provideRouter([
						{
							path: 'level1/:id1',
							component: Level1Component,
							children: [
								{
									path: 'level2/:id2',
									component: Level2Component,
									children: [
										{
											path: 'level3/:id3',
											component: Level3Component,
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
				'/level1/a/level2/b/level3/c',
				Level1Component,
			);

			expect(instance.allParamsGlobal()).toEqual({
				id1: 'a',
				id2: 'b',
				id3: 'c',
			});
		});

		it('should handle param name conflicts with global (child should override)', async () => {
			TestBed.configureTestingModule({
				providers: [
					provideRouter([
						{
							path: 'outer/:id',
							component: ConflictParentComponent,
							children: [
								{
									path: 'inner/:id',
									component: ConflictChildComponent,
								},
							],
						},
					]),
				],
			});

			const harness = await RouterTestingHarness.create();
			const instance = await harness.navigateByUrl(
				'/outer/parent-id/inner/child-id',
				ConflictParentComponent,
			);

			// Child param should override parent param
			expect(instance.globalId()).toEqual('child-id');
		});

		it('should handle missing params in child routes with global', async () => {
			TestBed.configureTestingModule({
				providers: [
					provideRouter([
						{
							path: 'root/:rootId',
							component: MissingParamComponent,
							children: [
								{
									path: 'child',
									component: EmptyChildComponent,
								},
							],
						},
					]),
				],
			});

			const harness = await RouterTestingHarness.create();
			const instance = await harness.navigateByUrl(
				'/root/123/child',
				MissingParamComponent,
			);

			expect(instance.rootIdGlobal()).toEqual('123');
			expect(instance.missingIdGlobal()).toEqual(null);
			expect(instance.missingWithDefaultGlobal()).toEqual('fallback');
		});

		it('should work with no params in route hierarchy with global', async () => {
			TestBed.configureTestingModule({
				providers: [
					provideRouter([
						{
							path: 'static',
							component: NoParamsGlobalComponent,
							children: [
								{
									path: 'page',
									component: NoParamsChildComponent,
								},
							],
						},
					]),
				],
			});

			const harness = await RouterTestingHarness.create();
			const instance = await harness.navigateByUrl(
				'/static/page',
				NoParamsGlobalComponent,
			);

			expect(instance.allParams()).toEqual({});
			expect(instance.anyParam()).toEqual(null);
		});

		it('should update reactively when child route params change with global', async () => {
			TestBed.configureTestingModule({
				providers: [
					provideRouter([
						{
							path: 'container/:containerId',
							component: ReactiveGlobalComponent,
							children: [
								{
									path: 'item/:itemId',
									component: ReactiveChildComponent,
								},
							],
						},
					]),
				],
			});

			const harness = await RouterTestingHarness.create();
			const instance = await harness.navigateByUrl(
				'/container/box1/item/thing1',
				ReactiveGlobalComponent,
			);

			expect(instance.itemIdGlobal()).toEqual('thing1');
			expect(instance.allGlobal()).toEqual({
				containerId: 'box1',
				itemId: 'thing1',
			});

			// Navigate to different item
			await harness.navigateByUrl('/container/box1/item/thing2');

			expect(instance.itemIdGlobal()).toEqual('thing2');
			expect(instance.allGlobal()).toEqual({
				containerId: 'box1',
				itemId: 'thing2',
			});
		});

		it('should work with global and transform returning complex types', async () => {
			TestBed.configureTestingModule({
				providers: [
					provideRouter([
						{
							path: 'app/:appId/:version',
							component: ComplexTransformComponent,
							children: [
								{
									path: 'module/:moduleId',
									component: ComplexChildComponent,
								},
							],
						},
					]),
				],
			});

			const harness = await RouterTestingHarness.create();
			const instance = await harness.navigateByUrl(
				'/app/myapp/1.2.3/module/auth',
				ComplexTransformComponent,
			);

			expect(instance.complexObject()).toEqual({
				appId: 'myapp',
				version: '1.2.3',
				moduleId: 'auth',
				paramCount: 3,
			});
		});
	});
});

@Component({
	template: ``,
})
export class UserProfileComponent {
	private _injector = inject(Injector);

	params = injectParams();
	userId = injectParams('id');
	paramKeysList = injectParams((params) => Object.keys(params));

	userIdCustomInjector?: Signal<string | null>;

	constructor() {
		this.userIdCustomInjector = injectParams('id', {
			injector: this._injector,
		});
	}
}

@Component({
	template: ``,
})
export class PostComponent {
	postId = injectParams('id', { parse: numberAttribute });
	postIdDefault = injectParams('id', {
		parse: numberAttribute,
		defaultValue: 69,
	});
}

// Test components for global option
@Component({
	template: `
		<router-outlet />
	`,
	imports: [RouterOutlet],
})
export class ParentWithGlobalComponent {
	paramsLocal = injectParams();
	parentIdLocal = injectParams('parentId');
	paramsGlobal = injectParams.global();
	childIdGlobal = injectParams.global('childId');
}

@Component({ template: `` })
export class ChildParamsComponent {}

@Component({
	template: `
		<router-outlet />
	`,
	imports: [RouterOutlet],
})
export class OrgWithGlobalComponent {
	globalParams = injectParams.global();
}

@Component({ template: `` })
export class UserGlobalComponent {}

@Component({ template: `` })
export class TeamGlobalComponent {}

@Component({
	template: `
		<router-outlet />
	`,
	imports: [RouterOutlet],
})
export class DashboardGlobalComponent {
	paramsKeys = injectParams.global((params) => Object.keys(params));
}

@Component({ template: `` })
export class WidgetGlobalComponent {}

@Component({
	template: `
		<router-outlet />
	`,
	imports: [RouterOutlet],
})
export class StoreGlobalComponent {
	productIdGlobal = injectParams.global('productId', {
		parse: numberAttribute,
	});
}

@Component({ template: `` })
export class ProductGlobalComponent {}

// Additional test components for edge cases
@Component({ template: `` })
export class DefaultValueComponent {
	missingParam = injectParams('nonexistent');
	missingParamWithDefault = injectParams('nonexistent', {
		defaultValue: 'default-value',
	});
}

@Component({ template: `` })
export class SearchComponent {
	query = injectParams('query');
}

@Component({ template: `` })
export class ArticleComponent {
	allParams = injectParams();
	category = injectParams('category');
	id = injectParams('id');
}

@Component({ template: `` })
export class TransformComponent {
	paramCount = injectParams((params) => Object.keys(params).length);
	hasId = injectParams((params) => 'id' in params);
	paramsAsString = injectParams((params) =>
		Object.entries(params)
			.map(([k, v]) => `${k}=${v}`)
			.join(','),
	);
}

@Component({ template: `` })
export class SpecialCharsComponent {
	name = injectParams('name');
}

@Component({
	template: `
		<router-outlet />
	`,
	imports: [RouterOutlet],
})
export class Level1Component {
	allParamsGlobal = injectParams.global();
}

@Component({
	template: `
		<router-outlet />
	`,
	imports: [RouterOutlet],
})
export class Level2Component {}

@Component({ template: `` })
export class Level3Component {}

@Component({
	template: `
		<router-outlet />
	`,
	imports: [RouterOutlet],
})
export class ConflictParentComponent {
	globalId = injectParams.global('id');
}

@Component({ template: `` })
export class ConflictChildComponent {}

@Component({
	template: `
		<router-outlet />
	`,
	imports: [RouterOutlet],
})
export class MissingParamComponent {
	rootIdGlobal = injectParams.global('rootId');
	missingIdGlobal = injectParams.global('missingId');
	missingWithDefaultGlobal = injectParams.global('missingId', {
		defaultValue: 'fallback',
	});
}

@Component({ template: `` })
export class EmptyChildComponent {}

@Component({
	template: `
		<router-outlet />
	`,
	imports: [RouterOutlet],
})
export class NoParamsGlobalComponent {
	allParams = injectParams.global();
	anyParam = injectParams.global('anyParam');
}

@Component({ template: `` })
export class NoParamsChildComponent {}

@Component({
	template: `
		<router-outlet />
	`,
	imports: [RouterOutlet],
})
export class ReactiveGlobalComponent {
	itemIdGlobal = injectParams.global('itemId');
	allGlobal = injectParams.global();
}

@Component({ template: `` })
export class ReactiveChildComponent {}

@Component({
	template: `
		<router-outlet />
	`,
	imports: [RouterOutlet],
})
export class ComplexTransformComponent {
	complexObject = injectParams.global((params) => ({
		...params,
		paramCount: Object.keys(params).length,
	}));
}

@Component({ template: `` })
export class ComplexChildComponent {}
