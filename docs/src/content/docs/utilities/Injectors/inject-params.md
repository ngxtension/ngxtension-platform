---
title: injectParams
description: ngxtension/inject-params
entryPoint: ngxtension/inject-params
badge: stable
contributors: ['enea-jahollari']
---

:::note[Router outlet is required]
`injectParams` works on all components that are inside routing context. Make sure the component you are using `injectParams` in, is part of your routes.
For the same reason - `injectParams` will not work correctly inside your root component (usually `AppComponent`)
:::

`injectParams` is a helper function that allows us to inject params from the current route as a signal.

Having params as a signal helps in a modern angular signals based architecture.

```ts
import { injectParams } from 'ngxtension/inject-params';
```

## Usage

### Get all route params

`injectParams` returns a signal with the current route params.

```ts
@Component({
	standalone: true,
	template: '<div>{{params() | json}}</div>',
})
class TestComponent {
	params = injectParams();
}
```

#### Transform all params

Or, if we want to transform the params, we can pass a function to `injectParams`.

```ts
@Component()
class TestComponent {
	paramsKeys = injectParams((params) => Object.keys(params)); // returns a signal with the keys of the params
}
```

### Specific param

If we want to get the value for a specific param, we can pass the name of the param to `injectParams`.

```ts
@Component({
	template: `
		@if (user(); as user) {
			<div>{{ user.name }}</div>
		} @else {
			<div>No user!</div>
		}
	`,
})
class TestComponent {
	userId = injectParams('id'); // returns a signal with the value of the id param

	user = derivedFrom(
		[this.userId],
		switchMap((id) => this.userService.getUser(id).pipe(startWith(null))),
	);
}
```

#### Transform

If you want to parse the specific param, you can pass a `parse` function.

```ts
@Component({
	template: `
		@if (user(); as user) {
			<div>{{ user.name }}</div>
		} @else {
			<div>No user!</div>
		}
	`,
})
class TestComponent {
	userId = injectParams('id', { parse: numberAttribute }); // returns a signal with the value of the id param parsed to a number

	user = derivedFrom(
		[this.userId],
		switchMap((id) => this.userService.getUser(id).pipe(startWith(null))),
	);
}
```

#### Default value

If we want to use a default value if there is no value, we can pass a `defaultValue`.

```ts
@Component({
	template: `
		@if (angular(); as angular) {
			<div>{{ angular.name }}</div>
		} @else {
			<div>No Angular version found!</div>
		}
	`,
})
class TestComponent {
	angularVersion = injectParams('version', { defaultValue: '19' }); // returns a signal with the value of the version param or '19' if not present

	angular = derivedFrom(
		[this.angularVersion],
		switchMap((version) =>
			this.angularService.getAngular(version).pipe(startWith(null)),
		),
	);
}
```

## Global Params

`injectParams.global()` allows you to access route params from the entire route hierarchy, including all parent and child routes. This is similar to Angular's `input()` and `input.required()` pattern.

:::note[Use Case]
Use `.global()` when you need to access params from child routes or when your component needs to be aware of the full routing context, not just its own route params.
:::

### Get all params from route hierarchy

```ts
@Component()
class ParentComponent {
	// Gets all params from parent and all child routes
	// Child params override parent params if they have the same name
	allParams = injectParams.global();
}
```

### Get specific param from route hierarchy

```ts
@Component()
class ParentComponent {
	// Gets the 'id' param from anywhere in the route hierarchy
	id = injectParams.global('id');
}
```

### Transform global params

```ts
@Component()
class ParentComponent {
	// Transform all params from the route hierarchy
	paramCount = injectParams.global((params) => Object.keys(params).length);
}
```

### With options

All the same options work with `.global()`:

```ts
@Component()
class TestComponent {
	// Parse param as number
	userId = injectParams.global('id', {
		parse: numberAttribute,
	});
}
```

### Example: Breadcrumbs

A common use case is building breadcrumbs that need access to all route params:

```ts
@Component({
	template: `
		<nav>
			@for (crumb of breadcrumbs(); track crumb.path) {
				<a [routerLink]="crumb.path">{{ crumb.label }}</a>
			}
		</nav>
		<router-outlet />
	`,
})
class LayoutComponent {
	allParams = injectParams.global();

	// Build breadcrumbs using all params from route hierarchy
	breadcrumbs = computed(() => buildBreadcrumbs(this.allParams()));
}
```
