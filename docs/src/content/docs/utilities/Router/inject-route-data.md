---
title: injectRouteData
description: Read the current route's data (static data and resolver results) as a signal.
entryPoint: ngxtension/inject-route-data
contributors: ['krzysztof-kachniarz']
---

`injectRouteData` gives you the `data` of the current route as a signal. That includes the static `data` from the route config and the results of resolvers. Read the whole object, one key, or derive a value with a function. The signal updates when the data changes, for example when a resolver re-runs.

:::note[Use it inside a routed component]
`injectRouteData` reads from the `ActivatedRoute` of the component that calls it, so it only sees that route's data. In the root component (usually `AppComponent`) the data is empty. Use [`injectRouteData.global()`](#data-from-the-whole-route-hierarchy) to read the data of child routes.
:::

## Usage

```angular-ts
// Route: { path: 'products/:id', component: ProductDetail, resolve: { product: productResolver } }
import { Component } from '@angular/core';
import { injectRouteData } from 'ngxtension/inject-route-data';

@Component({
	template: `
		@if (product(); as product) {
			<h1>{{ product.name }}</h1>
			<p>{{ product.description }}</p>
		}
	`,
})
export class ProductDetail {
	product = injectRouteData<Product>('product'); // Signal<Product | null>
}
```

Pass the expected type as the generic. Without it, the value is typed as `unknown`.

## Get all data

Call it without arguments to get the whole `Data` object, or pass a function to derive a value from it.

```ts
data = injectRouteData(); // Signal<Data>

dataKeys = injectRouteData((data) => Object.keys(data)); // Signal<string[]>
```

## Default value

`defaultValue` is returned when the key is missing (or `null`).

```ts
title = injectRouteData<string>('title', { defaultValue: 'Untitled' }); // Signal<string | null>
```

:::note
The return type stays `Signal<T | null>` even with a `defaultValue`.
:::

## Data from the whole route hierarchy

`injectRouteData` only sees its own route's data. A layout that renders a `<router-outlet>` doesn't see the data of its child routes. `injectRouteData.global()` reads the deepest active route and merges the data of every route from the root down to it. When two routes use the same key, the deeper route wins.

It accepts the same arguments and options as `injectRouteData`.

```angular-ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { injectRouteData } from 'ngxtension/inject-route-data';

@Component({
	imports: [RouterOutlet],
	template: `
		<header>
			<h1>{{ pageTitle() }}</h1>
			@if (showBreadcrumbs()) {
				<nav><!-- breadcrumbs --></nav>
			}
		</header>
		<main><router-outlet /></main>
	`,
})
export class Layout {
	pageTitle = injectRouteData.global('title', { defaultValue: 'My App' });
	showBreadcrumbs = injectRouteData.global('breadcrumbs', {
		defaultValue: false,
	});
}
```

```ts
const routes: Routes = [
	{
		path: '',
		component: Layout,
		data: { title: 'Home' },
		children: [
			{
				path: 'products',
				data: { title: 'Products', breadcrumbs: true },
				children: [
					{
						path: ':id',
						component: ProductDetail,
						data: { title: 'Product details' },
					},
				],
			},
		],
	},
];
```

On `/products/123`, `Layout` sees the merged data:

- `title`: `'Product details'` (from the deepest route)
- `breadcrumbs`: `true` (from the `products` route)

### Named outlets

By default `.global()` follows the primary outlet. Use the `outlet` option to read the data of the route active in a named outlet. Without an active route in that outlet, you get an empty object (or the `defaultValue`).

```ts
// URL: /home(sidebar:help)
sidebarTitle = injectRouteData.global('title', { outlet: 'sidebar' });
```

## Outside an injection context

Pass an `injector` when you call it outside a field initializer or constructor.

```ts
export class ProductDetail implements OnInit {
	private injector = inject(Injector);

	ngOnInit() {
		const product = injectRouteData<Product>('product', {
			injector: this.injector,
		});
	}
}
```

## API

```ts
function injectRouteData(): Signal<Data>;
function injectRouteData<T>(key: string, options?: RouteDataOptions<T>): Signal<T | null>;
function injectRouteData<T>(fn: (data: Data) => T, options?: RouteDataOptions<T>): Signal<T>;

// Same arguments, reading the merged data of the whole route hierarchy
injectRouteData.global(...);
```

| Option         | Type       | Default     | Description                                                          |
| -------------- | ---------- | ----------- | -------------------------------------------------------------------- |
| `defaultValue` | `T`        | `undefined` | Returned when the key is missing or `null`.                          |
| `outlet`       | `string`   | `undefined` | Only for `.global()`: read the route active in this named outlet.    |
| `injector`     | `Injector` | `undefined` | Use it when you call `injectRouteData` outside an injection context. |

## Related

- [injectParams](/utilities/router/inject-params/) and [injectQueryParams](/utilities/router/inject-query-params/): the same API for params and query params.
- [injectLeafActivatedRoute](/utilities/router/inject-leaf-activated-route/): the deepest active route as a signal.
- Angular's [`withComponentInputBinding()`](https://angular.dev/api/router/withComponentInputBinding) binds route data to `input()`s of the routed component.
