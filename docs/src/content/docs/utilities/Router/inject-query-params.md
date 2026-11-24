---
title: injectQueryParams
description: Read the current route's query params as a signal, as a whole object, a single value or an array.
entryPoint: ngxtension/inject-query-params
badge: stable
contributors: ['enea-jahollari']
---

`injectQueryParams` gives you the query params of the current route as a signal. Read all of them, one key, or a repeated key as an array, and optionally parse the value. The signal updates on every navigation, so you can feed it straight into `computed()` or a resource instead of subscribing to `ActivatedRoute.queryParams`.

:::note[Use it inside a routed component]
`injectQueryParams` reads from the `ActivatedRoute` of the component that calls it. Use it in components that are rendered by a route. In the root component (usually `AppComponent`) the initial value is read before the first navigation, so it starts empty.
:::

## Usage

Pass the name of a query param to get its value as `Signal<string | null>`.

```angular-ts
// URL: /users?search=nartc
import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { injectQueryParams } from 'ngxtension/inject-query-params';

@Component({
	template: `
		<p>Search results for: {{ search() }}</p>

		@for (user of users.value(); track user.id) {
			<div>{{ user.name }}</div>
		} @empty {
			<div>No users!</div>
		}
	`,
})
export class UserList {
	private userService = inject(UserService);

	search = injectQueryParams('search'); // Signal<string | null>

	users = rxResource({
		request: () => this.search() ?? '',
		loader: ({ request: search }) => this.userService.getUsers(search),
		defaultValue: [],
	});
}
```

When the URL changes to `/users?search=chau`, `search()` updates and the resource reloads the list.

## Get all query params

Call it without arguments to get the whole `Params` object.

```angular-ts
import { JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import { injectQueryParams } from 'ngxtension/inject-query-params';

@Component({
	imports: [JsonPipe],
	template: `<pre>{{ queryParams() | json }}</pre>`,
})
export class Debug {
	queryParams = injectQueryParams(); // Signal<Params>
}
```

### Transform all query params

Pass a function to derive any value from the full `Params` object. The function runs on every change.

```ts
export class Filters {
	keys = injectQueryParams((params) => Object.keys(params)); // Signal<string[]>

	hasAllFilters = computed(() =>
		['search', 'sort', 'page'].every((key) => this.keys().includes(key)),
	);
}
```

## Parse a single value

Query params are strings. Use `parse` to convert the value, for example with Angular's `numberAttribute`. `parse` only runs when the param is present.

```ts
// URL: /users?page=3
import { computed, numberAttribute } from '@angular/core';

export class Pagination {
	page = injectQueryParams('page', { parse: numberAttribute }); // Signal<number | null>

	nextPage = computed(() => (this.page() ?? 1) + 1);
}
```

## Default value

Use `defaultValue` for the value to return when the param is missing. It is returned as is, without going through `parse`.

```ts
// "/users?search=nartc" and "/users" both give 'nartc'
search = injectQueryParams('search', { defaultValue: 'nartc' });
```

:::note
The return type stays `Signal<T | null>` with `defaultValue`. Use `required: true` if you need a non-null type.
:::

## Required params

With `required: true` the signal type is non-null, and reading a missing param throws an error (`Query parameter <key> is required but was not provided.`). Use it on routes that are never reached without the param.

```ts
// URL: /checkout?orderId=42
orderId = injectQueryParams('orderId', { required: true }); // Signal<string>
```

## Array values

When a key appears more than once (`?products=Angular&products=Analog`), use `injectQueryParams.array` to get every value. A single value is wrapped in an array.

```angular-ts
// URL: /search?products=Angular&products=Analog
import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { injectQueryParams } from 'ngxtension/inject-query-params';

@Component({
	template: `
		<p>Selected: {{ productNames()?.join(', ') }}</p>

		@for (product of products.value(); track product.id) {
			<div>{{ product.name }}</div>
		} @empty {
			<div>No products!</div>
		}
	`,
})
export class ProductSearch {
	private productService = inject(ProductService);

	productNames = injectQueryParams.array('products'); // Signal<string[] | null>

	products = rxResource({
		request: () => this.productNames() ?? [],
		loader: ({ request: names }) => this.productService.getByNames(names),
		defaultValue: [],
	});
}
```

`parse`, `defaultValue` and `required` work with arrays too. `parse` runs on each item, and `defaultValue` is an array.

```ts
// URL: /search?productIds=1&productIds=2
productIds = injectQueryParams.array('productIds', {
	parse: numberAttribute,
}); // Signal<number[] | null>

// URL: /search → ['Angular']
productNames = injectQueryParams.array('products', {
	defaultValue: ['Angular'],
});
```

## Reusable transform functions

When several pages read the same set of params (page, page size, sort order), put the transform in a shared function.

```ts title="shared-filters.ts"
import type { Params } from '@angular/router';

export interface DefaultFilters {
	currentPage: number;
	pageSize: number;
	orderBy: string;
	direction: 'asc' | 'desc';
}

export const withDefaultFilters = (p: Params): DefaultFilters => ({
	currentPage: p['currentPage'] ? +p['currentPage'] : 1,
	pageSize: p['pageSize'] ? +p['pageSize'] : 15,
	orderBy: p['orderBy'] || 'created',
	direction: p['direction'] === 'asc' ? 'asc' : 'desc',
});
```

Then use it in any component, and spread it if you need extra params:

```angular-ts
import { Component, inject } from '@angular/core';
import { Router, type Params } from '@angular/router';
import { injectQueryParams } from 'ngxtension/inject-query-params';
import { withDefaultFilters } from './shared-filters';

@Component({
	template: `
		<app-pagination
			[currentPage]="filters().currentPage"
			[pageSize]="filters().pageSize"
			(currentPageChange)="updateParams({ currentPage: $event })"
			(pageSizeChange)="updateParams({ pageSize: $event })"
		/>
	`,
})
export class UserTable {
	private router = inject(Router);

	filters = injectQueryParams((p) => ({
		...withDefaultFilters(p),
		userId: p['userId'] as string | undefined,
	}));

	updateParams(queryParams: Params) {
		this.router.navigate([], {
			queryParams,
			queryParamsHandling: 'merge', // keep the other params
		});
	}
}
```

:::tip
If you also write to the URL, [`linkedQueryParam`](/utilities/router/linked-query-param/) gives you a writable signal that does the `router.navigate` call for you.
:::

## API

```ts
function injectQueryParams(): Signal<Params>;
function injectQueryParams<T>(fn: (params: Params) => T): Signal<T>;
function injectQueryParams(key: string): Signal<string | null>;
function injectQueryParams<T = string>(
	key: string,
	options: QueryParamsOptions<T, T> & { required: true },
): Signal<T>;
function injectQueryParams<T>(
	key: string,
	options?: QueryParamsOptions<T, T>,
): Signal<T | null>;

namespace injectQueryParams {
	function array<T = string>(
		key: string,
		options: QueryParamsOptions<T, T[]> & { required: true },
	): Signal<T[]>;
	function array<T = string>(
		key: string,
		options?: QueryParamsOptions<T, T[]>,
	): Signal<T[] | null>;
}
```

| Option         | Type                           | Default     | Description                                                               |
| -------------- | ------------------------------ | ----------- | ------------------------------------------------------------------------- |
| `parse`        | `(value: string \| null) => T` | `undefined` | Converts the raw string. For `.array`, runs on each item.                 |
| `defaultValue` | `T` (or `T[]` for `.array`)    | `undefined` | Returned when the param is missing. Not passed through `parse`.           |
| `required`     | `boolean`                      | `false`     | Throws when the param is missing and narrows the return type to non-null. |
| `injector`     | `Injector`                     | `undefined` | Use it when you call `injectQueryParams` outside an injection context.    |
| `transform`    | `(value: string \| null) => T` | `undefined` | Deprecated: use `parse`.                                                  |
| `initialValue` | `T`                            | `undefined` | Deprecated: use `defaultValue`.                                           |

If a single-value key appears more than once in the URL, `injectQueryParams(key)` returns the first value.

## Related

- [linkedQueryParam](/utilities/router/linked-query-param/): read and write a query param as a writable signal.
- [injectParams](/utilities/router/inject-params/): the same API for route params.
