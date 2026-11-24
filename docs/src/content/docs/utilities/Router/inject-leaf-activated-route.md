---
title: injectLeafActivatedRoute
description: Get the deepest active route as a signal, from any component, including layouts and the root component.
entryPoint: ngxtension/inject-leaf-activated-route
badge: stable
contributors: ['max-scopp']
---

`injectLeafActivatedRoute` returns a signal with the deepest (leaf) active route in the router state tree. It updates after every navigation. Use it in layouts, headers or the root component when you need the params, query params or data of the page that is currently displayed, not of the route your component belongs to.

## Usage

```angular-ts
import { Component, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { injectLeafActivatedRoute } from 'ngxtension/inject-leaf-activated-route';

@Component({
	selector: 'app-root',
	imports: [RouterOutlet],
	template: `
		<header>{{ title() }}</header>
		<router-outlet />
	`,
})
export class App {
	leafRoute = injectLeafActivatedRoute(); // Signal<ActivatedRoute>

	title = computed(() => this.leafRoute().snapshot.data['title'] ?? 'My app');
}
```

The leaf route is found by following `firstChild` from the root route until a route has no children.

## Why not `inject(ActivatedRoute)`?

`inject(ActivatedRoute)` returns the route the component was created for. With this route config:

```ts
const routes: Routes = [
	{
		path: 'dashboard/:orgId',
		component: Dashboard,
		children: [{ path: 'users/:userId', component: UserDetail }],
	},
];
```

`Dashboard` only sees `orgId` through `inject(ActivatedRoute)`. With `injectLeafActivatedRoute()` it gets the `users/:userId` route, so it can read `userId` too:

```ts
export class Dashboard {
	leafRoute = injectLeafActivatedRoute();

	userId = computed(() => this.leafRoute().snapshot.params['userId']);
	search = computed(() => this.leafRoute().snapshot.queryParams['q'] ?? '');
	requiresAuth = computed(
		() => this.leafRoute().snapshot.data['requiresAuth'] ?? false,
	);
}
```

:::note
`snapshot.params` only holds the params of the leaf route itself. To merge the params of every route from the root down to the leaf, use [`injectParams.global()`](/utilities/router/inject-params/#params-from-the-whole-route-hierarchy) or [`injectRouteData.global()`](/utilities/router/inject-route-data/#data-from-the-whole-route-hierarchy), which are built on this function.
:::

## Named outlets

Pass an outlet name to get the leaf route inside that outlet. The signal holds `null` while nothing is active in the outlet.

```ts
// URL: /home(sidebar:help)
sidebarLeaf = injectLeafActivatedRoute('sidebar'); // Signal<ActivatedRoute | null>

sidebarTitle = computed(() => this.sidebarLeaf()?.snapshot.data['title']);
```

## Updates

The signal emits after every `NavigationEnd` event, even when the leaf route object is the same (for example `/users/1` → `/users/2`, where Angular reuses the route). That keeps `computed`s that read `snapshot` up to date.

:::note[Injection context]
`injectLeafActivatedRoute` has no `injector` option. Call it in a field initializer, a constructor or another injection context. It stops listening when that context is destroyed.
:::

## API

```ts
function injectLeafActivatedRoute(): Signal<ActivatedRoute>;
function injectLeafActivatedRoute(
	outlet: string,
): Signal<ActivatedRoute | null>;
```

| Parameter | Type     | Description                                                                                     |
| --------- | -------- | ----------------------------------------------------------------------------------------------- |
| `outlet`  | `string` | Optional. The name of a named router outlet to look in. Without it, the primary outlet is used. |

## Related

- [injectParams](/utilities/router/inject-params/), [injectQueryParams](/utilities/router/inject-query-params/) and [injectRouteData](/utilities/router/inject-route-data/) when you only need one value as a signal.
- [injectNavigationEnd](/utilities/router/navigation-end/): the `NavigationEnd` events this signal is based on.
