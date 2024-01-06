---
title: injectQueryParams
description: ngxtension/inject-query-params
entryPoint: inject-query-params
badge: stable
contributor: enea-jahollari
---

`injectQueryParams` is a helper function that allows us to inject query params from the current route as a signal.

Having query params as a signal helps in a modern angular signals based architecture.

```ts
import { injectQueryParams } from 'ngxtension/inject-query-params';
```

## Usage

`injectQueryParams` when is called, returns a signal with the current query params.

```ts
@Component({
	standalone: true,
	template: '<div>{{queryParams() | json}}</div>',
})
class TestComponent {
	queryParams = injectQueryParams();
}
```

If we want to get the value for a specific query param, we can pass the name of the query param to `injectQueryParams`.

```ts
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

	filteredUsers = computedFrom(
		[this.searchParam],
		switchMap((searchQuery) =>
			this.userService.getUsers(searchQuery).pipe(startWith([])),
		),
	);
}
```

Or, if we want to transform the query params, we can pass a function to `injectQueryParams`.

```ts
@Component()
class TestComponent {
	queryParamsKeys = injectQueryParams((params) => Object.keys(params)); // returns a signal with the keys of the query params

	allQueryParamsArePassed = computed(() => {
		const keys = this.queryParamsKeys();
		return ['search', 'sort', 'page'].every((x) => keys.includes(x));
	});
}
```
