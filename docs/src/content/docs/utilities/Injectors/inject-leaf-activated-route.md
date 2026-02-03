---
title: injectLeafActivatedRoute
description: ngxtension/inject-leaf-activated-route
entryPoint: ngxtension/inject-leaf-activated-route
badge: stable
contributors: ['max-scopp']
---

:::note[Router outlet is required]
`injectLeafActivatedRoute` works on all components that are inside routing context. Make sure the component you are using `injectLeafActivatedRoute` in is part of your routes.
:::

`injectLeafActivatedRoute` is a helper function that returns a signal containing the deepest (leaf) activated route in the router state tree.

The leaf route is the deepest child route that has no children of its own. This is useful when you need to access route information from the currently active, deepest route regardless of your component's position in the route hierarchy.

Having the leaf route as a signal helps in a modern Angular signals-based architecture and automatically updates whenever navigation ends.

```ts
import { injectLeafActivatedRoute } from 'ngxtension/inject-leaf-activated-route';
```

## Usage

### Get the leaf activated route

`injectLeafActivatedRoute` when called, returns a signal with the current leaf activated route.

```ts
@Component({
	standalone: true,
	template: `
		<div>Current route: {{ leafRoute().snapshot.url }}</div>
		<div>Route params: {{ leafRoute().snapshot.params | json }}</div>
	`,
})
class MyComponent {
	leafRoute = injectLeafActivatedRoute();
}
```

### Access route parameters from leaf route

The most common use case is to access route parameters from the deepest active route, regardless of where your component is in the component tree.

```ts
@Component({
	template: `
		@if (user(); as user) {
			<div>{{ user.name }}</div>
		} @else {
			<div>Loading...</div>
		}
	`,
})
class ParentComponent {
	leafRoute = injectLeafActivatedRoute();

	// Access the 'id' param from the leaf route
	userId = computed(() => this.leafRoute().snapshot.params['id']);
}
```

### Access multiple route parameters

```ts
@Component({
	template: `
		<div>Organization: {{ orgId() }}</div>
		<div>User: {{ userId() }}</div>
	`,
})
class DashboardComponent {
	leafRoute = injectLeafActivatedRoute();

	orgId = computed(() => this.leafRoute().snapshot.params['orgId']);
	userId = computed(() => this.leafRoute().snapshot.params['userId']);
}
```

### Access query parameters

You can also access query parameters from the leaf route:

```ts
@Component({
	template: `
		<div>Search query: {{ searchQuery() }}</div>
	`,
})
class SearchComponent {
	leafRoute = injectLeafActivatedRoute();

	searchQuery = computed(
		() => this.leafRoute().snapshot.queryParams['query'] ?? '',
	);
}
```

### Access route data

Access static or resolved data from the leaf route:

```ts
@Component({
	template: `
		<div>Requires auth: {{ requiresAuth() }}</div>
	`,
})
class AdminComponent {
	leafRoute = injectLeafActivatedRoute();

	requiresAuth = computed(
		() => this.leafRoute().snapshot.data['requiresAuth'] ?? false,
	);
}
```

## Why use this over `inject(ActivatedRoute)`?

When you inject `ActivatedRoute` directly, you get the route associated with the current component. This might not be the deepest route if you have nested routes with child components.

`injectLeafActivatedRoute` always gives you the deepest active route, which is often what you need when you want to access parameters from the currently displayed page, regardless of your component's position in the route hierarchy.

### Example scenario

Consider this route structure:

```
/dashboard/:orgId/users/:userId
```

With this component hierarchy:

```
DashboardComponent (at /dashboard/:orgId)
  └─ UsersComponent (at users/:userId)
```

In `DashboardComponent`, if you use `inject(ActivatedRoute)`, you only get access to `orgId`. But with `injectLeafActivatedRoute()`, you can access both `orgId` and `userId` because it gives you the deepest route.

## Reactive updates

The signal automatically updates whenever navigation ends, ensuring it always reflects the current leaf route:

```ts
@Component({
	template: `
		<div>Current user ID: {{ userId() }}</div>
		<button (click)="navigateToUser('123')">User 123</button>
		<button (click)="navigateToUser('456')">User 456</button>
	`,
})
class UserListComponent {
	router = inject(Router);
	leafRoute = injectLeafActivatedRoute();

	userId = computed(() => this.leafRoute().snapshot.params['id']);

	navigateToUser(id: string) {
		this.router.navigate(['/users', id]);
		// The userId signal will automatically update after navigation
	}
}
```

## Use with other inject utilities

`injectLeafActivatedRoute` works great with other ngxtension utilities like `injectParams` and `injectQueryParams`, but it's particularly useful when you need access to the full route object or when building reusable components that need to be aware of the current route state.

```ts
import { injectParams } from 'ngxtension/inject-params';

@Component({})
class MyComponent {
	// Using injectParams with global option
	// internally uses injectLeafActivatedRoute
	userId = injectParams('id', { global: true });

	// Or use injectLeafActivatedRoute directly for more control
	leafRoute = injectLeafActivatedRoute();
	allParams = computed(() => this.leafRoute().snapshot.params);
}
```
