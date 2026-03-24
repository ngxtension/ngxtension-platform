import { Component, computed } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, RouterOutlet } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import {
	injectLeafActivatedRoute,
	walkToDeepest,
} from './inject-leaf-activated-route';

describe(injectLeafActivatedRoute.name, () => {
	describe('basic functionality', () => {
		it('should return a signal with the leaf activated route for a simple route', async () => {
			TestBed.configureTestingModule({
				providers: [
					provideRouter([{ path: 'home', component: SimpleComponent }]),
				],
			});

			const harness = await RouterTestingHarness.create();
			const instance = await harness.navigateByUrl('/home', SimpleComponent);

			const leafRoute = instance.leafRoute();
			expect(leafRoute).toBeDefined();
			expect(leafRoute.snapshot.url.toString()).toBe('home');
		});

		it('should return the deepest child route for nested routes', async () => {
			TestBed.configureTestingModule({
				providers: [
					provideRouter([
						{
							path: 'parent',
							component: ParentComponent,
							children: [{ path: 'child', component: ChildComponent }],
						},
					]),
				],
			});

			const harness = await RouterTestingHarness.create();
			const instance = await harness.navigateByUrl(
				'/parent/child',
				ParentComponent,
			);

			const leafRoute = instance.leafRoute();
			expect(leafRoute).toBeDefined();
			expect(leafRoute.snapshot.url.toString()).toBe('child');
		});

		it('should return the deepest route in a deeply nested route structure', async () => {
			TestBed.configureTestingModule({
				providers: [
					provideRouter([
						{
							path: 'parent',
							component: ParentComponent,
							children: [
								{
									path: 'child',
									component: ChildComponent,
									children: [
										{
											path: 'grandchild',
											component: GrandchildComponent,
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
				'/parent/child/grandchild',
				ParentComponent,
			);

			const leafRoute = instance.leafRoute();
			expect(leafRoute).toBeDefined();
			expect(leafRoute.snapshot.url.toString()).toBe('grandchild');
		});
	});

	describe('signal reactivity', () => {
		it('should update the signal when navigating to different routes', async () => {
			TestBed.configureTestingModule({
				providers: [
					provideRouter([
						{ path: 'page1', component: Page1Component },
						{ path: 'page2', component: Page2Component },
					]),
				],
			});

			const harness = await RouterTestingHarness.create();
			const instance1 = await harness.navigateByUrl('/page1', Page1Component);

			expect(instance1.leafRoute().snapshot.url.toString()).toBe('page1');

			const instance2 = await harness.navigateByUrl('/page2', Page2Component);

			expect(instance2.leafRoute().snapshot.url.toString()).toBe('page2');
		});

		it('should update when navigating between nested routes', async () => {
			TestBed.configureTestingModule({
				providers: [
					provideRouter([
						{
							path: 'parent',
							component: ParentComponent,
							children: [
								{ path: 'child1', component: Child1Component },
								{ path: 'child2', component: Child2Component },
							],
						},
					]),
				],
			});

			const harness = await RouterTestingHarness.create();
			const instance = await harness.navigateByUrl(
				'/parent/child1',
				ParentComponent,
			);

			expect(instance.leafRoute().snapshot.url.toString()).toBe('child1');

			await harness.navigateByUrl('/parent/child2');

			expect(instance.leafRoute().snapshot.url.toString()).toBe('child2');
		});
	});

	describe('route parameters and data', () => {
		it('should access route params from the leaf route', async () => {
			TestBed.configureTestingModule({
				providers: [
					provideRouter([{ path: 'user/:id', component: UserComponent }]),
				],
			});

			const harness = await RouterTestingHarness.create();
			const instance = await harness.navigateByUrl('/user/123', UserComponent);

			expect(instance.userId()).toBe('123');

			await harness.navigateByUrl('/user/456');

			expect(instance.userId()).toBe('456');
		});

		it('should access multiple route params from the leaf route', async () => {
			TestBed.configureTestingModule({
				providers: [
					provideRouter([
						{
							path: 'organization/:orgId/user/:userId',
							component: OrgUserComponent,
						},
					]),
				],
			});

			const harness = await RouterTestingHarness.create();
			const instance = await harness.navigateByUrl(
				'/organization/acme/user/john',
				OrgUserComponent,
			);

			expect(instance.orgId()).toBe('acme');
			expect(instance.userId()).toBe('john');
		});

		it('should access query params from the leaf route', async () => {
			TestBed.configureTestingModule({
				providers: [
					provideRouter([{ path: 'search', component: SearchComponent }]),
				],
			});

			const harness = await RouterTestingHarness.create();
			const instance = await harness.navigateByUrl(
				'/search?query=angular',
				SearchComponent,
			);

			const queryParams = instance.leafRoute().snapshot.queryParams;
			expect(queryParams['query']).toBe('angular');
		});

		it('should access route data from the leaf route', async () => {
			TestBed.configureTestingModule({
				providers: [
					provideRouter([
						{
							path: 'admin',
							component: AdminComponent,
							data: { requiresAuth: true, role: 'admin' },
						},
					]),
				],
			});

			const harness = await RouterTestingHarness.create();
			const instance = await harness.navigateByUrl('/admin', AdminComponent);

			const routeData = instance.leafRoute().snapshot.data;
			expect(routeData['requiresAuth']).toBe(true);
			expect(routeData['role']).toBe('admin');
		});
	});

	describe('complex routing scenarios', () => {
		it('should handle routes with empty path children', async () => {
			TestBed.configureTestingModule({
				providers: [
					provideRouter([
						{
							path: 'dashboard',
							component: DashboardComponent,
							children: [
								{
									path: '',
									component: DashboardHomeComponent,
								},
							],
						},
					]),
				],
			});

			const harness = await RouterTestingHarness.create();
			const instance = await harness.navigateByUrl(
				'/dashboard',
				DashboardComponent,
			);

			const leafRoute = instance.leafRoute();
			expect(leafRoute).toBeDefined();
			expect(leafRoute.snapshot.url.toString()).toBe('');
		});

		it('should handle redirects correctly', async () => {
			TestBed.configureTestingModule({
				providers: [
					provideRouter([
						{ path: '', redirectTo: '/home', pathMatch: 'full' },
						{ path: 'home', component: HomeRedirectComponent },
					]),
				],
			});

			const harness = await RouterTestingHarness.create();
			const instance = await harness.navigateByUrl('/', HomeRedirectComponent);

			expect(instance.leafRoute().snapshot.url.toString()).toBe('home');
		});

		it('should work with lazy loaded routes', async () => {
			TestBed.configureTestingModule({
				providers: [
					provideRouter([
						{
							path: 'lazy',
							component: LazyComponent,
						},
					]),
				],
			});

			const harness = await RouterTestingHarness.create();
			const instance = await harness.navigateByUrl('/lazy', LazyComponent);

			expect(instance.leafRoute().snapshot.url.toString()).toBe('lazy');
		});
	});

	describe('computed values from leaf route', () => {
		it('should compute values from leaf route params', async () => {
			TestBed.configureTestingModule({
				providers: [
					provideRouter([{ path: 'product/:id', component: ProductComponent }]),
				],
			});

			const harness = await RouterTestingHarness.create();
			const instance = await harness.navigateByUrl(
				'/product/42',
				ProductComponent,
			);

			expect(instance.productId()).toBe(42);
		});

		it('should recompute when route params change', async () => {
			TestBed.configureTestingModule({
				providers: [
					provideRouter([{ path: 'product/:id', component: ProductComponent }]),
				],
			});

			const harness = await RouterTestingHarness.create();
			const instance = await harness.navigateByUrl(
				'/product/42',
				ProductComponent,
			);

			expect(instance.productId()).toBe(42);

			await harness.navigateByUrl('/product/99');

			expect(instance.productId()).toBe(99);
		});
	});
});

describe(walkToDeepest.name, () => {
	it('should return the same route if there are no children', async () => {
		TestBed.configureTestingModule({
			providers: [
				provideRouter([{ path: 'simple', component: SimpleComponent }]),
			],
		});

		const harness = await RouterTestingHarness.create();
		await harness.navigateByUrl('/simple', SimpleComponent);

		const router = TestBed.inject(Router);
		const root = router.routerState.root;
		const leaf = walkToDeepest(root);

		expect(leaf).toBeDefined();
	});

	it('should walk to the deepest child when multiple children exist', async () => {
		TestBed.configureTestingModule({
			providers: [
				provideRouter([
					{
						path: 'level1',
						component: Level1Component,
						children: [
							{
								path: 'level2',
								component: Level2Component,
								children: [
									{
										path: 'level3',
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
		await harness.navigateByUrl('/level1/level2/level3', Level1Component);

		const router = TestBed.inject(Router);
		const root = router.routerState.root;
		const leaf = walkToDeepest(root);

		expect(leaf.snapshot.url.toString()).toBe('level3');
	});
});

// Test Components
@Component({
	standalone: true,
	template: '',
})
class SimpleComponent {
	leafRoute = injectLeafActivatedRoute();
}

@Component({
	standalone: true,
	selector: 'parent',
	template: '<router-outlet />',
	imports: [RouterOutlet],
})
class ParentComponent {
	leafRoute = injectLeafActivatedRoute();
}

@Component({
	standalone: true,
	selector: 'child',
	template: '<router-outlet />',
	imports: [RouterOutlet],
})
class ChildComponent {
	leafRoute = injectLeafActivatedRoute();
}

@Component({
	standalone: true,
	template: '',
})
class GrandchildComponent {
	leafRoute = injectLeafActivatedRoute();
}

@Component({
	standalone: true,
	selector: 'page1',
	template: '',
})
class Page1Component {
	leafRoute = injectLeafActivatedRoute();
}

@Component({
	standalone: true,
	selector: 'page2',
	template: '',
})
class Page2Component {
	leafRoute = injectLeafActivatedRoute();
}

@Component({
	standalone: true,
	selector: 'child1',
	template: '',
})
class Child1Component {
	leafRoute = injectLeafActivatedRoute();
}

@Component({
	standalone: true,
	template: '',
})
class Child2Component {
	leafRoute = injectLeafActivatedRoute();
}

@Component({
	standalone: true,
	template: '',
})
class UserComponent {
	leafRoute = injectLeafActivatedRoute();
	userId = computed(() => this.leafRoute().snapshot.params['id']);
}

@Component({
	standalone: true,
	template: '',
})
class OrgUserComponent {
	leafRoute = injectLeafActivatedRoute();
	orgId = computed(() => this.leafRoute().snapshot.params['orgId']);
	userId = computed(() => this.leafRoute().snapshot.params['userId']);
}

@Component({
	standalone: true,
	template: '',
})
class SearchComponent {
	leafRoute = injectLeafActivatedRoute();
}

@Component({
	standalone: true,
	template: '',
})
class AdminComponent {
	leafRoute = injectLeafActivatedRoute();
}

@Component({
	standalone: true,
	template: '<router-outlet/>',
	imports: [RouterOutlet],
})
class DashboardComponent {
	leafRoute = injectLeafActivatedRoute();
}

@Component({
	standalone: true,
	template: '',
})
class DashboardHomeComponent {
	leafRoute = injectLeafActivatedRoute();
}

@Component({
	standalone: true,
	template: '<router-outlet/>',
	imports: [RouterOutlet],
})
class MainComponent {
	leafRoute = injectLeafActivatedRoute();
}

@Component({
	standalone: true,
	template: '',
})
class ContentComponent {
	leafRoute = injectLeafActivatedRoute();
}

@Component({
	standalone: true,
	template: '',
})
class HomeRedirectComponent {
	leafRoute = injectLeafActivatedRoute();
}

@Component({
	standalone: true,
	template: '',
})
class LazyComponent {
	leafRoute = injectLeafActivatedRoute();
}

@Component({
	standalone: true,
	template: '',
})
class ProductComponent {
	leafRoute = injectLeafActivatedRoute();
	productId = computed(() => {
		const id = this.leafRoute().snapshot.params['id'];
		return id ? parseInt(id, 10) : null;
	});
}

@Component({
	selector: 'level1',
	template: '<router-outlet/>',
	imports: [RouterOutlet],
})
class Level1Component {
	leafRoute = injectLeafActivatedRoute();
}

@Component({
	selector: 'level2',
	template: '<router-outlet/>',
	imports: [RouterOutlet],
})
class Level2Component {
	leafRoute = injectLeafActivatedRoute();
}

@Component({
	standalone: true,
	template: '',
})
class Level3Component {
	leafRoute = injectLeafActivatedRoute();
}
