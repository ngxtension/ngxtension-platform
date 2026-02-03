---
title: injectRouteData
description: ngxtension/inject-route-data
entryPoint: ngxtension/inject-route-data
contributors: ['krzysztof-kachniarz']
---

:::note[Router outlet is required]
`injectRouteData` works on all components that are inside routing context. Make sure the component you are using `injectRouteData` in, is part of your routes.
For the same reason - `injectRouteData` will not work correctly inside your root component (usually `AppComponent`)
:::

`injectRouteData` is a helper function that allows us to inject data from the current route as a signal.

Having route data as a signal helps in a modern angular signals based architecture.

```ts
import { injectRouteData } from 'ngxtension/inject-route-data';
```

## Usage

`injectRouteData` when is called, returns a signal with the current route data.

```ts
@Component({
	standalone: true,
	template: '<div>{{routeData() | json}}</div>',
})
class TestComponent {
	routeData = injectRouteData();
}
```

Or, if we want to transform the data, we can pass a function to `injectRouteData`.

```ts
@Component()
class TestComponent {
	routeDataKeys = injectRouteData((data) => Object.keys(data)); // returns a signal with the keys of the route data object
}
```

### Specific value

If we want to get the value for a specific key, we can pass the name of the object key to `injectRouteData`.

```ts
@Component({
	template: `
		<div>{{ details().name }}</div>
		<div>{{ details().description }}</div>
	`,
})
class TestComponent {
	details: Signal<unknown> = injectRouteData('details'); // returns a signal with the value of the details key in route data object
}
```

### Default value

You can pass a `defaultValue` that will be returned if the key is not present in the route data:

```ts
@Component()
class TestComponent {
	title: Signal<string> = injectRouteData('title', {
		defaultValue: 'Default Title',
	});
}
```

### Custom injector

You can also pass a custom injector:

```ts
@Component()
class TestComponent implements OnInit {
	injector = inject(Injector);

	ngOnInit() {
		const details = injectRouteData('details', {
			injector: this.injector,
		});
	}
}
```

## Global Route Data

`injectRouteData.global()` allows you to access route data from the entire route hierarchy, including all parent and child routes. This is similar to Angular's `input()` and `input.required()` pattern.

:::note[Use Case]
Use `.global()` when you need to access data from child routes or when your component needs to be aware of the full routing context. Child route data overrides parent route data when there are naming conflicts.
:::

### Get all data from route hierarchy

```ts
@Component()
class ParentComponent {
	// Gets all data from parent and all child routes
	// Child route data overrides parent route data if they have the same key
	allData = injectRouteData.global();
}
```

### Get specific data from route hierarchy

```ts
@Component()
class ParentComponent {
	// Gets the 'title' data from anywhere in the route hierarchy
	title = injectRouteData.global('title');
}
```

### Transform global data

```ts
@Component()
class ParentComponent {
	// Transform all data from the route hierarchy
	dataCount = injectRouteData.global((data) => Object.keys(data).length);
}
```

### With options

All the same options work with `.global()`:

```ts
@Component()
class TestComponent {
	// With default value
	theme = injectRouteData.global('theme', {
		defaultValue: 'light',
	});
}
```

### Example: Layout with metadata

A common use case is a layout component that needs to access metadata from any child route:

```ts
@Component({
	standalone: true,
	template: `
		<header>
			<h1>{{ pageTitle() }}</h1>
			@if (showBreadcrumbs()) {
				<nav><!-- breadcrumbs --></nav>
			}
		</header>
		<main>
			<router-outlet />
		</main>
	`,
})
class LayoutComponent {
	// Access data from the entire route tree
	allData = injectRouteData.global();

	pageTitle = injectRouteData.global('title', {
		defaultValue: 'My App',
	});

	showBreadcrumbs = injectRouteData.global('breadcrumbs', {
		defaultValue: false,
	});
}
```

Routes configuration:

```ts
const routes: Routes = [
	{
		path: '',
		component: LayoutComponent,
		data: { title: 'Home' },
		children: [
			{
				path: 'products',
				component: ProductsComponent,
				data: { title: 'Products', breadcrumbs: true },
				children: [
					{
						path: ':id',
						component: ProductDetailComponent,
						data: { title: 'Product Details', breadcrumbs: true },
					},
				],
			},
		],
	},
];
```

When navigating to `/products/123`, the `LayoutComponent` will have access to all merged data:

- `title`: 'Product Details' (from the deepest child)
- `breadcrumbs`: true (from parent route)
