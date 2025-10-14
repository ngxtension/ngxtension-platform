---
title: linkedQueryParam
description: ngxtension/linked-query-param
entryPoint: ngxtension/linked-query-param
badge: experimental
contributors: ['enea-jahollari']
---

:::note[Router outlet is required]
`linkedQueryParam` works on all components that are inside routing context. Make sure the component you are using `linkedQueryParam` in, is part of your routes.
For the same reason - `linkedQueryParam` will not work correctly inside your root component (usually `AppComponent`)
:::

## `linkedQueryParam` - Two-way binding for query parameters

The `linkedQueryParam` utility function creates a signal that is linked to a query parameter in the URL. This allows you to easily keep your Angular application's state in sync with the URL, making it easier to share and bookmark specific views.

Key Features:

- **Two-way binding**: Changes to the signal are reflected in the URL, and changes to the URL are reflected in the signal.
- **Parsing and stringification**: You can provide functions to parse the query parameter value when reading it from the URL and stringify it when writing it to the URL.
- **Built-in parsers**: The library provides built-in parsers for common data types, such as numbers and booleans.
- **Default values**: You can provide a default value to be used if the query parameter is not present in the URL.
- **Coalesced updates**: Multiple updates to the signal within the same browser task are coalesced into a single URL update, improving performance.
- **Supports Navigation Extras**: The function supports navigation extras like `queryParamsHandling`, `onSameUrlNavigation`, `replaceUrl`, and `skipLocationChange`.
- **Testable**: The function is easy to test thanks to its reliance on Angular's dependency injection system.

## Usage

Here's a basic example of how to use `linkedQueryParam`:

```ts
import { Component, inject } from '@angular/core';
import { linkedQueryParam } from 'ngxtension/linked-query-param';

@Component({
	template: `
		<p>Page: {{ currentPage() }}</p>
		<button (click)="currentPage.set(currentPage() + 1)">Next Page</button>
	`,
})
export class MyComponent {
	readonly currentPage = linkedQueryParam('page', {
		parse: (value) => parseInt(value ?? '1', 10),
	});
}
```

In this example, the page signal is linked to the page query parameter. The parse function ensures that the value is always a number, defaulting to 1 if the parameter is not present or cannot be parsed. Clicking the "Next Page" button increments the page signal, which in turn updates the URL to `/search?page=2`, `/search?page=3`, and so on.

### Parsing and Stringification

You can provide `parse` and `stringify` functions to transform the query parameter value between the URL and the signal. This is useful for handling different data types, such as booleans, numbers, and objects.

```ts
export class MyCmp {
	// Parse a boolean query parameter
	showHidden = linkedQueryParam('showHidden', {
		parse: (value) => value === 'true',
		stringify: (value) => (value ? 'true' : 'false'),
	});

	// Parse a number query parameter
	count = linkedQueryParam('count', {
		parse: (value) => parseInt(value ?? '0', 10),
		stringify: (value) => value.toString(),
	});

	// Parse an object query parameter
	filter = linkedQueryParam('filter', {
		parse: (value) => JSON.parse(value ?? '{}'),
		stringify: (value) => JSON.stringify(value),
	});

	// Parse an array query parameter
	selectedCategoriesIds = linkedQueryParam<string[]>('selectedCategoriesIds', {
		parse: (value) => value?.split(',').map((x) => x.trim()) ?? [],
		stringify: (value) => value.join(','),
	});
}
```

NOTE: Make sure to put the `stringify` fn after the `parse` fn in order for types to work correctly.

### Default Values

You can provide a `defaultValue` to be used if the query parameter is not present in the URL.

```ts
// Default to page 1
page = linkedQueryParam('page', {
	defaultValue: 1,
});
```

Note: You cannot use both `defaultValue` and `parse` at the same time. If you need to parse the value and provide a default, use the parse function to handle both cases.

### Built-in Parsers

The `ngxtension` library provides some built-in parsers for common data types:

- `paramToNumber`: Parses a number from a string.
- `paramToBoolean`: Parses a boolean from a string.

```ts
export class MyDataComponent {
	// Parse a number query parameter, defaults to null if the param is not available
	readonly page = linkedQueryParam('page', {
		parse: paramToNumber(),
	});

	readonly pageWithDefault = linkedQueryParam('page', {
		// Default to 1 if the param is not available
		parse: paramToNumber({ defaultValue: 1 }),
	});

	// Parse a boolean query parameter with a default value of false
	readonly showHidden = linkedQueryParam('showHidden', {
		parse: paramToBoolean(false),
	});
}
```

### Handling Null and Undefined Values

The `linkedQueryParam` function handles null and undefined values gracefully.
If the query parameter is not present in the URL, the signal will be initialized with null.
You can also set the signal to null to remove the query parameter from the URL.

### Navigation extras

These will work the same as using them on the `navigate()` method of the Router.

You can either provide the navigation extras in the options param in the `linkedQueryParam` function, or you can use the `provideLinkedQueryParamConfig` function to provide the navigation extras either in a component (recommended) or globally.

- `queryParamsHandling`

You can specify how to handle query parameters when updating the URL.

Options:

- `merge` (default): default behavior that will merge current params with new ones
- `preserve`: won't update to the new params
- `''`: removes all other params except this one

Example usage:

```ts
page = linkedQueryParam('page', {
	queryParamsHandling: '',
});
```

- `skipLocationChange`

When true, navigates without pushing a new state into history.
If you want to navigate back to the previous query param using back button or browser back button, this will break that feature,
because changes on the query params won't be registered in the browser history.

```ts
page = linkedQueryParam('page', {
	skipLocationChange: true,
});
```

- `replaceUrl`

You can specify whether to replace the current URL in the browser's history or push a new entry.

```ts
const page = linkedQueryParam('page', { replaceUrl: true });
```

#### With `provideLinkedQueryParamConfig`

In the example below, the `preserveFragment` option will be set to `true` for all the `linkedQueryParam` function usages in the component (and its children).

```ts
import { provideLinkedQueryParamConfig } from 'ngxtension/linked-query-param';

@Component({
	providers: [provideLinkedQueryParamConfig({ preserveFragment: true })],
})
export class MyComponent {
	readonly searchQuery = linkedQueryParam('searchQuery');
	readonly page = linkedQueryParam('page');
}
```

### Examples of usage

- Usage with template driven forms & resource API

```ts
@Component({
	selector: 'app-todos',
	template: `
		<form #ngForm="ngForm">
			<label>
				Search:
				<!--
              In order to not update the url on every keystroke, 
              we update it only on submit (when user presses Enter).
              Also, set the currentPage to 1 in order to search on a page that doesn't exist.
            -->
				<input
					[(ngModel)]="search"
					(ngModelChange)="page.set(1)"
					[ngModelOptions]="{ updateOn: 'submit' }"
					placeholder="Search todos"
					name="search"
				/>
			</label>
			<label>
				Status:

				<select [(ngModel)]="status" name="status">
					<option value="">All</option>
					<option value="completed">Completed</option>
					<option value="active">Active</option>
				</select>
			</label>

			<label>
				Limit
				<input [(ngModel)]="limit" type="number" name="limit" />
			</label>

			<label>
				Page
				<input [(ngModel)]="page" type="number" name="page" />
			</label>

			<button type="submit" hidden>Submit</button>
		</form>

		<h3>Todos</h3>

		@if (todos.isLoading()) {
			<div>Loading...</div>
		}
		@if (todos.error()) {
			<div>Error: {{ todos.error() }}</div>
		}
		<ul>
			@for (todo of todos.value(); track todo.id) {
				<li>
					<input
						type="checkbox"
						[attr.name]="todo.id"
						[ngModel]="todo.completed"
						(ngModelChange)="updateTodo(todo.id, $event)"
					/>
					{{ todo.title }}
				</li>
			}
		</ul>
	`,
	imports: [FormsModule],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodosComponent {
	private http = inject(HttpClient);

	search = linkedQueryParam('search');
	status = linkedQueryParam('status');
	limit = linkedQueryParam('limit', {
		parse: paramToNumber({ defaultValue: 10 }),
	});
	page = linkedQueryParam('page', {
		parse: paramToNumber({ defaultValue: 1 }),
	});

	todos = rxResource({
		request: () => ({
			search: this.search(),
			status: this.status(),
			limit: this.limit(),
			page: this.page(),
		}),
		loader: ({ request }) => {
			return this.http.get<Todo[]>(
				`https://jsonplaceholder.typicode.com/todos`,
				{
					params: {
						_search: request.search ?? '',
						_status: request.status ?? '',
						_per_page: request.limit,
						_page: request.page,
					},
				},
			);
		},
	});

	updateTodo(id: number, completed: boolean) {
		this.todos.value.update((todos) => {
			if (!todos) return [];
			return todos.map((x) => ({
				...x,
				completed: x.id === id ? completed : x.completed,
			}));
		});
	}
}

interface Todo {
	id: number;
	title: string;
	completed: boolean;
}
```
