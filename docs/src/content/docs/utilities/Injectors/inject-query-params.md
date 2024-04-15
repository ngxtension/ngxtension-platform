---
title: injectQueryParams
description: ngxtension/inject-query-params
entryPoint: inject-query-params
badge: stable
contributors: ['enea-jahollari']
---

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

		@for (user of filteredUsers()) {
			<div>{{ user.name }}</div>
		} @empty {
			<div>No users!</div>
		}
	`,
})
class TestComponent {
	searchParam = injectQueryParams('search'); // returns a signal with the value of the search query param

	filteredUsers = computedAsync(
		() => this.userService.getUsers(this.searchParam() ?? ''),
		{ initialValue: [] },
	);
}
```

If we want to additional transform the value into any shape, we can pass a `transform` function.

```ts
// Example url: /users?pageNumber=1

import { injectQueryParams } from 'ngxtension/inject-query-params';

@Component({
	template: `
		Page number: {{ pageNumber() }} Multiplied number: {{ multipliedNumber() }}
	`,
})
class TestComponent {
	pageNumber = injectQueryParams('pageNumber', { transform: numberAttribute });

	multipliedNumber = computed(() => this.pageNumber() * 2);
}
```

If we want to use a default value if there is no value, we can pass a `initialValue`.

```ts
// Example urls producing the same output: "/users?search=nartc", "/users"

import { injectQueryParams } from 'ngxtension/inject-query-params';

@Component({
	template: `
		Search results for: {{ searchParam() }}

		@for (user of filteredUsers()) {
			<div>{{ user.name }}</div>
		} @empty {
			<div>No users!</div>
		}
	`,
})
class TestComponent {
	// returns a signal with the value of the search query param or '' if not provided.
	searchParam = injectQueryParams('search', { initialValue: 'nartc' });

	filteredUsers = computedAsync(
		() => this.userService.getUsers(this.searchParam()),
		{
			initialValue: [],
		},
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

	products = computedAsync(
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
	// returns a signal with the array values of the product query param and transform each value
	productIds = injectQueryParams.array('productIds', {
		transform: numberAttribute,
	});

	products = computedAsync(
		() => this.productService.getByIds(this.productIds()),
		{ initialValue: [] },
	);
}
```

If we want to use a default value if there are no values, we can pass a `initialValue`.

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
		initialValue: ['Angular'],
	});

	products = computedAsync(
		() => this.productService.getByNames(this.productNames()),
		{ initialValue: [] },
	);
}
```
