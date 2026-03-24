---
title: injectQueryParams
description: ngxtension/inject-query-params
entryPoint: ngxtension/inject-query-params
badge: stable
contributors: ['enea-jahollari']
---

:::note[Router outlet is required]
`injectQueryParams` works on all components that are inside routing context. Make sure the component you are using `injectQueryParams` in, is part of your routes.
For the same reason - `injectQueryParams` will not work correctly inside your root component (usually `AppComponent`)
:::

`injectQueryParams` is a helper function that allows us to inject query params from the current route as a signal.

Having query params as a signal helps in a modern angular signals based architecture.

## Import

```ts
import { injectQueryParams } from 'ngxtension/inject-query-params';
```

## Usage

### Get all query params

`injectQueryParams` when it's called, returns a signal with the current query params.

```ts
import { injectQueryParams } from 'ngxtension/inject-query-params';

@Component({
	template: '<div>{{queryParams() | json}}</div>',
})
class TestComponent {
	queryParams = injectQueryParams();
}
```

Or, if we want to transform the query params, we can pass a function to `injectQueryParams`.

```ts
import { injectQueryParams } from 'ngxtension/inject-query-params';

@Component()
class TestComponent {
	queryParamsKeys = injectQueryParams((params) => Object.keys(params)); // returns a signal with all keys of the query params

	allQueryParamsArePassed = computed(() => {
		const keys = this.queryParamsKeys();
		return ['search', 'sort', 'page'].every((x) => keys.includes(x));
	});
}
```

### Get a single value

If we want to get the value for a specific query param, we can pass the name of the query param to `injectQueryParams`.

```ts
// Example url: /users?search=nartc

import { injectQueryParams } from 'ngxtension/inject-query-params';

@Component({
	template: `
		Search results for: {{ searchParam() }}

		@for (user of filteredUsers(); track user.id) {
			<div>{{ user.name }}</div>
		} @empty {
			<div>No users!</div>
		}
	`,
})
class TestComponent {
	searchParam = injectQueryParams('search'); // returns a signal with the value of the search query param

	filteredUsers = derivedAsync(
		() => this.userService.getUsers(this.searchParam() ?? ''),
		{ initialValue: [] },
	);
}
```

If we want to additional parse the value into any shape, we can pass a `parse` function.

```ts
// Example url: /users?pageNumber=1

import { injectQueryParams } from 'ngxtension/inject-query-params';

@Component({
	template: `
		Page number: {{ pageNumber() }} Multiplied number: {{ multipliedNumber() }}
	`,
})
class TestComponent {
	pageNumber = injectQueryParams('pageNumber', { parse: numberAttribute });

	multipliedNumber = computed(() => this.pageNumber() * 2);
}
```

If we want to use a default value if there is no value, we can pass a `defaultValue`.

```ts
// Example urls producing the same output: "/users?search=nartc", "/users"

import { injectQueryParams } from 'ngxtension/inject-query-params';

@Component({
	template: `
		Search results for: {{ searchParam() }}

		@for (user of filteredUsers(); track user.id) {
			<div>{{ user.name }}</div>
		} @empty {
			<div>No users!</div>
		}
	`,
})
class TestComponent {
	// returns a signal with the value of the search query param or '' if not provided.
	searchParam = injectQueryParams('search', { defaultValue: 'nartc' });

	filteredUsers = derivedAsync(
		() => this.userService.getUsers(this.searchParam()),
		{ initialValue: [] },
	);
}
```

### Get an array value

If we want to get the values for a specific query param, we can pass the name of the query param, to `injectQueryParams.array`.

```ts
// Example url: /search?products=Angular&products=Analog

import { injectQueryParams } from 'ngxtension/inject-query-params';

@Component({
	template: `
		Selected products: {{ productNames() }}

		@for (product of products(); track product.id) {
			<div>{{ product.name }}</div>
		} @empty {
			<div>No products!</div>
		}
	`,
})
class TestComponent {
	productService = inject(ProductService);
	// returns a signal with the array values of the product query param
	productNames = injectQueryParams.array('products');

	products = derivedAsync(
		() => this.productService.getByNames(this.productNames()),
		{ initialValue: [] },
	);
}
```

If we want to additional transform the values into any shape, we can pass a `transform` function.

```ts
// Example url: /search?productIds=Angular&productIds=Analog

import { injectQueryParams } from 'ngxtension/inject-query-params';

@Component({
	template: `
		Selected products: {{ productIds() }}

		@for (product of products(); track product.id) {
			<div>{{ product.name }}</div>
		} @empty {
			<div>No products!</div>
		}
	`,
})
class TestComponent {
	productService = inject(ProductService);
	// returns a signal with the array values of the product query param and parse each value
	productIds = injectQueryParams.array('productIds', {
		parse: numberAttribute,
	});

	products = derivedAsync(
		() => this.productService.getByIds(this.productIds()),
		{ initialValue: [] },
	);
}
```

If we want to use a default value if there are no values, we can pass a `defaultValue`.

```ts
// Example urls producing the same output: "/search?products=Angular", "/search"

import { injectQueryParams } from 'ngxtension/inject-query-params';

@Component({
	template: `
		Selected products: {{ productNames() }}

		@for (product of products(); track product.id) {
			<div>{{ product.name }}</div>
		} @empty {
			<div>No products!</div>
		}
	`,
})
class TestComponent {
	productService = inject(ProductService);
	// returns a signal with the array values of the product query param or 'Angular' if the user provides none
	productNames = injectQueryParams.array('products', {
		defaultValue: ['Angular'],
	});

	products = derivedAsync(
		() => this.productService.getByNames(this.productNames()),
		{ initialValue: [] },
	);
}
```

### Reusable transform functions

When working with query params, there are times we need to get the same value from the query params multiple times on different components. For example, currentPage, pageSize, order and direction of the current page of a paginated list. We can create a reusable transform function to avoid repeating the code.

We can have this shared code in a reusable function and then use it in the component.

```ts
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

Then we can use it in the component like this:

```ts
import { withDefaultFilters } from './shared-filters';

@Component({
	template: `
		<pagination
			[currentPage]="queryParams().currentPage"
			[pageSize]="queryParams().pageSize"
			(currentPageChange)="updateParams({ currentPage: $event })"
			(pageSizeChange)="updateParams({ pageSize: $event })"
		/>
	`,
})
export class MyComponent {
	private router = inject(Router);

	queryParams = injectQueryParams((p) => withDefaultFilters(p));

	// or we if also need some more params in the current page

	queryParams = injectQueryParams((p) => ({
		...withDefaultFilters(p),
		userId: p['userId'], // will be undefined if not in the query params
	}));

	ngOnInit() {
		// we can use the filters in the component
		const { currentPage, pageSize, orderBy, direction } = this.queryParams();
	}

	updateParams(queryParams: Params) {
		this.router.navigate([], {
			// Update query params without changing the current page
			queryParams, // The query params to update
			queryParamsHandling: 'merge', // Merge with existing query params
		});
	}
}
```

This should help you to avoid repeating code.
