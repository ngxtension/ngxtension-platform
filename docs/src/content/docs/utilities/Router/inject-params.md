---
title: injectParams
description: Read the current route's path params as a signal, with parsing, defaults and access to the whole route hierarchy.
entryPoint: ngxtension/inject-params
badge: stable
contributors: ['enea-jahollari']
---

`injectParams` gives you the path params of the current route (the `:id` in `users/:id`) as a signal. Read all of them, a single one, or derive a value with a function. The signal updates when the params change, for example when you navigate from `/users/1` to `/users/2` and Angular reuses the component.

:::note[Use it inside a routed component]
`injectParams` reads from the `ActivatedRoute` of the component that calls it, so it only sees the params of that route. In the root component (usually `AppComponent`) there are no params. Use [`injectParams.global()`](#params-from-the-whole-route-hierarchy) to read params of child routes.
:::

## Usage

```angular-ts
// Route: { path: 'users/:id', component: UserDetail }
import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { injectParams } from 'ngxtension/inject-params';

@Component({
	template: `
		@if (user.value(); as user) {
			<h1>{{ user.name }}</h1>
		} @else if (user.isLoading()) {
			<p>Loading...</p>
		}
	`,
})
export class UserDetail {
	private userService = inject(UserService);

	userId = injectParams('id'); // Signal<string | null>

	user = rxResource({
		request: () => this.userId() ?? undefined, // undefined skips the loader
		loader: ({ request: id }) => this.userService.getUser(id),
	});
}
```

## Get all params

Call it without arguments to get the whole `Params` object, or pass a function to derive a value from it.

```ts
params = injectParams(); // Signal<Params>

paramKeys = injectParams((params) => Object.keys(params)); // Signal<string[]>
```

## Parse a param

Path params are strings. Use `parse` to convert the value, for example with Angular's `numberAttribute`.

```ts
import { numberAttribute } from '@angular/core';

// Route: products/:id, URL: /products/42
productId = injectParams('id', { parse: numberAttribute }); // Signal<number | null>
```

## Default value

`defaultValue` is returned when the param is missing or empty. With a default, the signal type is non-null.

```ts
// Routes 'docs' and 'docs/:version' share this component. URL: /docs → '19'
version = injectParams('version', { defaultValue: '19' }); // Signal<string>

// With parse, the default must have the parsed type
page = injectParams('page', { parse: numberAttribute, defaultValue: 1 }); // Signal<number>
```

The default value is returned as is, without going through `parse`.

## Required params

With `required: true` the signal type is non-null, and reading a missing param throws an error (`Parameter <key> is required but was not provided.`).

```ts
userId = injectParams('id', { required: true }); // Signal<string>
```

## Params from the whole route hierarchy

`injectParams` only sees the params of its own route. A layout component that renders a `<router-outlet>` doesn't see the `:id` of its child route. `injectParams.global()` reads the deepest active route (in the primary outlet) and merges the params of every route from the root down to it. When two routes use the same name, the deeper route wins.

It accepts the same arguments and options as `injectParams`.

```ts
// Routes: 'orgs/:orgId' → children: 'users/:userId'
// URL: /orgs/acme/users/7
export class OrgLayout {
	allParams = injectParams.global(); // { orgId: 'acme', userId: '7' }
	userId = injectParams.global('userId'); // '7'
	userIdAsNumber = injectParams.global('userId', { parse: numberAttribute }); // 7
	paramCount = injectParams.global((params) => Object.keys(params).length); // 2
}
```

A common use case is breadcrumbs in a layout component:

```angular-ts
import { Component, computed } from '@angular/core';
import { RouterLink, RouterOutlet, type Params } from '@angular/router';
import { injectParams } from 'ngxtension/inject-params';

@Component({
	imports: [RouterLink, RouterOutlet],
	template: `
		<nav>
			@for (crumb of breadcrumbs(); track crumb.path) {
				<a [routerLink]="crumb.path">{{ crumb.label }}</a>
			}
		</nav>
		<router-outlet />
	`,
})
export class Layout {
	allParams = injectParams.global();

	breadcrumbs = computed(() => buildBreadcrumbs(this.allParams()));
}
```

## API

```ts
function injectParams(): Signal<Params>;
function injectParams<T>(fn: (params: Params) => T, options?: { injector?: Injector }): Signal<T>;
function injectParams(key: string): Signal<string | null>;
function injectParams<T = string>(key: string, options: ParamsOptions & { required: true }): Signal<T>;
function injectParams<T>(key: string, options: ParamsOptions & { defaultValue: T }): Signal<T>;
function injectParams<T>(key: string, options: ParamsOptions & { parse: (v: string) => T }): Signal<T | null>;

// Same overloads, reading the merged params of the whole route hierarchy
injectParams.global(...);
```

| Option         | Type                   | Default     | Description                                                                  |
| -------------- | ---------------------- | ----------- | ---------------------------------------------------------------------------- |
| `parse`        | `(value: string) => T` | `undefined` | Converts the raw string param.                                               |
| `defaultValue` | `T`                    | `undefined` | Returned when the param is missing or empty. Makes the return type non-null. |
| `required`     | `boolean`              | `false`     | Throws when the param is missing. Makes the return type non-null.            |
| `injector`     | `Injector`             | `undefined` | Use it when you call `injectParams` outside an injection context.            |

## Related

- [injectQueryParams](/utilities/router/inject-query-params/): the same API for query params.
- [injectRouteData](/utilities/router/inject-route-data/): the same API for route `data`.
- [injectLeafActivatedRoute](/utilities/router/inject-leaf-activated-route/): the deepest active route as a signal.
- Angular's [`withComponentInputBinding()`](https://angular.dev/api/router/withComponentInputBinding) binds params to `input()`s of the routed component. Prefer it when only the routed component needs the param.
