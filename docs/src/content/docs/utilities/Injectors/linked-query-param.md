---
title: linkedQueryParam
description: ngxtension/linked-query-param
entryPoint: ngxtension/linked-query-param
badge: stable
contributors: ['enea-jahollari']
---

:::note[Router outlet is required]
`linkedQueryParam` works on all components that are inside routing context. Make sure the component you are using `linkedQueryParam` in, is part of your routes.
For the same reason - `linkedQueryParam` will not work correctly inside your root component (usually `AppComponent`)
:::

## `linkedQueryParam` - Two-way binding for query parameters

The `linkedQueryParam` utility function creates a signal that is linked to a query parameter in the URL. This allows you to easily keep your Angular application's state in sync with the URL, making it easier to share and bookmark specific views.

### Why Use `linkedQueryParam`?

Instead of manually reading from `ActivatedRoute.queryParams` and manually updating the router, `linkedQueryParam` provides:

- **Automatic synchronization** between your component state and URL query parameters
- **Reactive updates** - changes in either direction (signal ↔ URL) happen automatically
- **Type-safe** - full TypeScript support with proper typing
- **Performance optimized** - batched updates prevent unnecessary navigation
- **Easy to use** - works seamlessly with template-driven forms, reactive forms, and signals

Key Features:

- **Two-way binding**: Changes to the signal are reflected in the URL, and changes to the URL are reflected in the signal.
- **Parsing and stringification**: You can provide functions to parse the query parameter value when reading it from the URL and stringify it when writing it to the URL.
- **Built-in parsers**: The library provides built-in parsers for common data types, such as numbers and booleans.
- **Default values**: You can provide a default value to be used if the query parameter is not present in the URL.
- **Coalesced updates**: Multiple updates to the signal within the same browser task are coalesced into a single URL update, improving performance.
- **Supports Navigation Extras**: The function supports navigation extras like `queryParamsHandling`, `onSameUrlNavigation`, `replaceUrl`, and `skipLocationChange`.
- **Global configuration**: Configure default behavior for all `linkedQueryParam` instances using providers.
- **Dynamic keys**: Support for dynamic query parameter keys using signals, functions, or static strings.
- **Source signal integration**: Link existing signals (including input signals, model signals, and regular signals) to query parameters.
- **Automatic synchronization**: Automatically synchronize source values when dynamic keys change.
- **Initial value from URL**: When using source signals, they automatically initialize from query parameters if present.
- **Testable**: The function is easy to test thanks to its reliance on Angular's dependency injection system.

## Quick Start

Here's the simplest possible example:

```ts
import { Component } from '@angular/core';
import { linkedQueryParam } from 'ngxtension/linked-query-param';

@Component({
	template: `
		<input [(ngModel)]="search" placeholder="Search" />
		<p>Searching for: {{ search() }}</p>
	`,
})
export class SearchComponent {
	readonly search = linkedQueryParam('search');
}
```

That's it! The `search` signal is now automatically synced with the `?search=` query parameter in your URL.

## Usage

Here's a more complete example showing basic usage with parsing:

```angular-ts
import { Component, inject } from '@angular/core';
import { linkedQueryParam } from 'ngxtension/linked-query-param';

@Component({
	template: `
	  <label>
	    Search:
	    <input name="search" [(ngModel)]="searchQuery" />
    </label>

		<p>Page: {{ currentPage() }}</p>
		<button (click)="currentPage.set(currentPage() + 1)">
		  Next Page
    </button>
	`,
})
export class MyComponent {
	readonly searchQuery = linkedQueryParam('search');

	readonly currentPage = linkedQueryParam('page', {
		parse: (x) => parseInt(x ?? '1', 10),
	});
}
```

In this example, the `currentPage` signal is linked to the `page` query parameter and the `searchQuery` is linked to the `search` query param.
The parse function ensures that the value is always a number, defaulting to 1 if the parameter is not present or cannot be parsed.
Clicking the "Next Page" button increments the page signal, which in turn updates the URL to `/search?page=2`, `/search?page=3`, and so on.

### Parsing and Stringification

You can provide `parse` and `stringify` functions to transform the query parameter value between the URL and the signal. This is useful for handling different data types, such as booleans, numbers, and objects.

> Check out built-in parsers in the [Built-in Parsers](#built-in-parsers) section below.

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

:::note[You cannot use both `defaultValue` and `parse` at the same time]
If you need to parse the value and provide a default, use the parse function to handle both cases.
:::

### Built-in Parsers

The `ngxtension` library provides built-in parsers for common data types:.

#### Available Parsers

- **`paramToNumber`**: Parses a number from a string query parameter
- **`paramToBoolean`**: Parses a boolean from a string query parameter

```ts
import {
	linkedQueryParam,
	paramToNumber,
	paramToBoolean,
} from 'ngxtension/linked-query-param';

export class MyDataComponent {
	// Using paramToNumber - returns number | null if param is not available
	readonly page = linkedQueryParam('page', {
		parse: paramToNumber(),
	});

	// Using paramToNumber with default - returns number (never null)
	readonly pageWithDefault = linkedQueryParam('page', {
		parse: paramToNumber({ defaultValue: 1 }),
	});

	// Using paramToBoolean - returns boolean | null if param is not available
	readonly showHidden = linkedQueryParam('showHidden', {
		parse: paramToBoolean(),
	});

	// Using paramToBoolean with default - returns boolean (never null)
	readonly isVisible = linkedQueryParam('visible', {
		parse: paramToBoolean({ defaultValue: false }),
	});
}
```

#### `paramToNumber` Parser

The `paramToNumber` parser converts string query parameters to numbers. It handles invalid values gracefully by returning `null` (or the default value if provided).

```ts
import { linkedQueryParam, paramToNumber } from 'ngxtension/linked-query-param';

// Returns number | null if param is not present or invalid
const page = linkedQueryParam('page', {
	parse: paramToNumber(),
});
// URL: ?page=5 → signal: 5
// URL: ?page=abc → signal: null
// URL: (no param) → signal: null

// Returns number (never null) with default value
const pageWithDefault = linkedQueryParam('page', {
	parse: paramToNumber({ defaultValue: 1 }),
});
// URL: (no param) → signal: 1
// URL: ?page=abc → signal: 1 (invalid value falls back to default)
// URL: ?page=5 → signal: 5
```

#### `paramToBoolean` Parser

The `paramToBoolean` parser converts string query parameters to booleans. The parser considers the string `'true'` (case-sensitive) as `true` and any other value (including empty string, `'false'`, `'0'`, etc.) as `false`.

```ts
import {
	linkedQueryParam,
	paramToBoolean,
} from 'ngxtension/linked-query-param';

// Returns boolean | null if param is not present
const showHidden = linkedQueryParam('showHidden', {
	parse: paramToBoolean(),
});
// URL: ?showHidden=true → signal: true
// URL: ?showHidden=false → signal: false
// URL: ?showHidden=anything → signal: false
// URL: (no param) → signal: null

// Returns boolean (never null) with default value
const showHiddenWithDefault = linkedQueryParam('showHidden', {
	parse: paramToBoolean({ defaultValue: true }),
});
// URL: (no param) → signal: true (default)
// URL: ?showHidden=true → signal: true
```

### Handling Null and Undefined Values

The `linkedQueryParam` function handles null and undefined values gracefully:

- **When query parameter is missing**: The signal will be initialized with `null` (unless a `defaultValue` or `parse` with default is provided)
- **When query parameter exists but is empty** (`?param=`): The signal will be initialized with an empty string `''`
- **Setting signal to null**: Removes the query parameter from the URL
- **Setting signal to undefined**: Treated the same as `null`, removes the query parameter from the URL

```ts
export class MyComponent {
	readonly search = linkedQueryParam('search');

	// URL: /page → search() = null
	// URL: /page?search= → search() = ''
	// URL: /page?search=hello → search() = 'hello'

	clearSearch() {
		this.search.set(null); // Removes ?search from URL
	}
}
```

### Coalesced Updates (Performance Optimization)

Multiple updates to `linkedQueryParam` signals within the same browser task are automatically coalesced into a single URL update. This improves performance by preventing unnecessary navigation.

```ts
export class MyComponent {
	readonly page = linkedQueryParam('page');
	readonly search = linkedQueryParam('search');

	updateBoth() {
		// All three updates happen synchronously
		this.page.set(1);
		this.page.set(2);
		this.search.set('query');

		// Only ONE navigation will occur with the final values:
		// URL will be updated to: ?page=2&search=query
		// All intermediate values (page=1) are skipped
	}
}
```

This coalescing works for:

- Multiple updates to the same signal
- Updates to different `linkedQueryParam` signals
- Source signal updates (when using the `source` option)

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

You can configure default behavior for all `linkedQueryParam` instances using the `provideLinkedQueryParamConfig` provider. This is useful when you want to set consistent navigation behavior across your application or specific components.

```ts
import { provideLinkedQueryParamConfig } from 'ngxtension/linked-query-param';

@Component({
	providers: [provideLinkedQueryParamConfig({ preserveFragment: true })],
})
export class MyComponent {
	readonly searchQuery = linkedQueryParam('searchQuery');
	readonly page = linkedQueryParam('page');
	// Both will use preserveFragment: true
}
```

You can also provide global configuration at the application level:

```ts
bootstrapApplication(AppComponent, {
	providers: [
		provideLinkedQueryParamConfig({
			queryParamsHandling: 'merge',
			automaticallySynchronizeOnKeyChange: true,
		}),
	],
});
```

The configuration is hierarchical - component-level configuration overrides global configuration, and individual `linkedQueryParam` options override both.

```ts
// Global config
provideLinkedQueryParamConfig({ preserveFragment: true });

// Component config (overrides global)
@Component({
	providers: [provideLinkedQueryParamConfig({ replaceUrl: true })],
})
export class MyComponent {
	// This will use: preserveFragment: true (from global), replaceUrl: true (from component)
	readonly param1 = linkedQueryParam('param1');

	// This will use: preserveFragment: true (from global), replaceUrl: true (from component), skipLocationChange: true (from individual)
	readonly param2 = linkedQueryParam('param2', { skipLocationChange: true });
}
```

### Dynamic Keys

The `linkedQueryParam` function supports dynamic query parameter keys. You can use signals, functions (that use signals), or static strings as the key parameter.

```ts
export class DynamicKeyComponent {
	// Dynamic key using a signal
	readonly keySignal = signal('search');
	readonly searchParam = linkedQueryParam(this.keySignal);

	// Dynamic key using a function (is reactive only with signals)
	readonly getKey = () => 'page';
	readonly pageParam = linkedQueryParam(this.getKey);

	// Static key (most common)
	readonly staticParam = linkedQueryParam('filter');
}
```

:::note[You cannot use `input.required()` and `model.required()` as keys]
Using required `input`/`model` won't work as they require everything to be lazy evaluated, but linkedQueryParam calls those signals synchronously to provide the initial value synchronously
You can safely use normal `input`/`model`. Keep in mind that the initial value will come from the router data instead of the initial value that you pass to those inputs.
:::

When using dynamic keys, the query parameter will automatically update when the key changes. The old parameter will be removed from the URL and the new one will be added (with the current value of the signal).

### Source Signal Integration

You can link existing signals to query parameters using the `source` option. This is particularly useful when working with input signals, model signals, signal forms, or any other writable signals.

**Key Behavior:**

- **Two-way binding**: Changes to the source signal update the URL, and URL changes update the source signal
- **Initial value from URL**: If a query parameter exists in the URL, the source signal is automatically initialized with that value (after parsing)

```ts
import { input, model, linkedSignal, signal } from '@angular/core';
import { linkedQueryParam, paramToNumber } from 'ngxtension/linked-query-param';

export class SearchPageComponent {
	// Model signal as source
	readonly page = model<number>(1);
	readonly pageParam = linkedQueryParam('page', {
		source: this.page,
		parse: paramToNumber({ defaultValue: 1 }),
	});
	// If URL has ?page=5, this.page() will be 5
	// If URL has no page param, this.page() will be 1 (default)

	// Regular signal as source
	readonly filterSignal = signal<string | null>(null);
	readonly filterParam = linkedQueryParam('filter', {
		source: this.filterSignal,
	});
	// If URL has ?filter=active, this.filterSignal() will be 'active'
	// If URL has no filter param, this.filterSignal() will be null

	// Input signal as source -> requires conversion to writable signal
	readonly searchInput = input<string>('');
	// Convert input to writable signal using linkedSignal
	readonly localSearchInput = linkedSignal(() => this.searchInput());
	readonly searchParam = linkedQueryParam('search', {
		source: this.localSearchInput,
	});
}
```

#### Working with Input Signals

Input signals are read-only, so you need to convert them to writable signals first using `linkedSignal`:

```ts
import { input, linkedSignal } from '@angular/core';
import { linkedQueryParam } from 'ngxtension/linked-query-param';

export class MyComponent {
	// Input signal (read-only)
	readonly initialValue = input<string>('');

	// Convert to writable signal
	readonly writableValue = linkedSignal(() => this.initialValue());

	// Use as source
	readonly queryParam = linkedQueryParam('value', {
		source: this.writableValue,
	});
}
```

#### Working with Model Signals

Model signals are already writable, making them perfect for two-way binding:

```ts
import { model } from '@angular/core';
import { linkedQueryParam, paramToNumber } from 'ngxtension/linked-query-param';

@Component({
	template: `
		<input [(ngModel)]="pageModel" type="number" />
		<p>Page: {{ pageModel() }}</p>
	`,
})
export class PaginationComponent {
	// Model signal - perfect for two-way binding
	readonly pageModel = model<number>(1);

	// Link to query parameter
	readonly pageParam = linkedQueryParam('page', {
		source: this.pageModel,
		parse: paramToNumber({ defaultValue: 1 }),
	});

	// Now pageModel and URL are always in sync!
}
```

#### Initialization Behavior

When using source signals, here's how initialization works:

```ts
export class ExampleComponent {
	readonly data = signal<string>('initial');
	readonly param = linkedQueryParam('data', {
		source: this.data,
	});
}

// Scenario 1: URL has ?data=hello
// → this.data() will be 'hello' (URL value overrides initial value)

// Scenario 2: URL has no data param
// → this.data() will be 'initial' (keeps initial value)

// Scenario 3: URL has no data param, but default is provided
readonly dataWithDefault = signal<string>('initial');
readonly paramWithDefault = linkedQueryParam('data', {
	source: this.dataWithDefault,
	defaultValue: 'default',
});
// → this.dataWithDefault() will be 'default' (uses default)
```

### Automatic Synchronization on Key Change

When using dynamic keys with source signals, you can control whether the source value should be synchronized to the new key when the key changes.

#### How It Works

**When `automaticallySynchronizeOnKeyChange: true` (default):**

- When the key changes, the source signal's current value is automatically written to the new query parameter key
- If the new key already exists in the URL, that existing value is used instead (source signal gets the URL value)

**When `automaticallySynchronizeOnKeyChange: false`:**

- When the key changes, the new query parameter is not immediately set
- The query parameter will only update when the source signal changes next
- Useful when you want to change multiple parameters atomically or avoid intermediate URL states

```ts
export class SyncComponent {
	readonly keySignal = signal('param1');
	readonly sourceSignal = signal('value');

	// Automatically synchronize source value when key changes (default: true)
	readonly syncParam = linkedQueryParam(this.keySignal, {
		source: this.sourceSignal,
		automaticallySynchronizeOnKeyChange: true, // This is the default
	});

	// Don't synchronize source value when key changes
	readonly noSyncParam = linkedQueryParam(this.keySignal, {
		source: this.sourceSignal,
		automaticallySynchronizeOnKeyChange: false,
	});
}
```

#### Example: With Automatic Synchronization (default)

```ts
export class ExampleComponent {
	readonly keySignal = signal('search');
	readonly searchValue = signal<string | null>(null);

	readonly searchParam = linkedQueryParam(this.keySignal, {
		source: this.searchValue,
		automaticallySynchronizeOnKeyChange: true, // default
	});

	// Initial: key = 'search', searchValue = null, URL: no param

	// User types 'hello'
	searchValue.set('hello');
	// → URL: ?search=hello

	// Change key to 'query'
	keySignal.set('query');
	// → URL: ?query=hello (value automatically moved to new key)
	// → searchValue() = 'hello' (unchanged)
}
```

#### Example: Without Automatic Synchronization

```ts
export class ExampleComponent {
	readonly keySignal = signal('param1');
	readonly valueSignal = signal('value1');

	readonly param = linkedQueryParam(this.keySignal, {
		source: this.valueSignal,
		automaticallySynchronizeOnKeyChange: false,
	});

	// Initial: key = 'param1', value = 'value1', URL: ?param1=value1

	// Change key to 'param2'
	keySignal.set('param2');
	// → URL: ?param1=value1 (unchanged, param2 not yet set)
	// → valueSignal() = 'value1' (unchanged)

	// Now update the value
	valueSignal.set('value2');
	// → URL: ?param2=value2 (now updates to new key)
	// → Old param1 is removed
}
```

#### Using Existing Query Parameter Values

When a dynamic key changes to a key that already exists in the URL, `linkedQueryParam` automatically uses that existing value:

```ts
export class ExampleComponent {
	readonly keySignal = signal('key1');
	readonly valueSignal = signal<string | null>(null);

	readonly param = linkedQueryParam(this.keySignal, {
		source: this.valueSignal,
	});
}

// Start with URL: ?existingKey=existing-value
// keySignal starts as 'key1', valueSignal is null

// Change key to 'existingKey' (which already has a value in URL)
keySignal.set('existingKey');
// → valueSignal() becomes 'existing-value' (uses existing URL value)
// → URL: ?existingKey=existing-value (unchanged)
```

This behavior works whether `automaticallySynchronizeOnKeyChange` is `true` or `false`.

### Working with Multiple `linkedQueryParam` Instances

You can use multiple `linkedQueryParam` instances in the same component. They work independently and can safely interact with each other, even when using dynamic keys.

```ts
export class FilterComponent {
	readonly search = linkedQueryParam('search');
	readonly page = linkedQueryParam('page', {
		parse: paramToNumber({ defaultValue: 1 }),
	});
	readonly sort = linkedQueryParam('sort');

	// All three can update simultaneously, and only ONE navigation will occur
	// (thanks to coalescing)
	resetFilters() {
		this.search.set(null);
		this.page.set(1);
		this.sort.set('name');
	}
}
```

#### Multiple Dynamic Keys

When using multiple `linkedQueryParam` instances with dynamic keys, they can safely change keys simultaneously:

```ts
export class AdvancedFilterComponent {
	readonly key1Signal = signal('filter1');
	readonly key2Signal = signal('filter2');

	readonly param1 = linkedQueryParam(this.key1Signal);
	readonly param2 = linkedQueryParam(this.key2Signal);

	// Even if keys change simultaneously and overlap,
	// linkedQueryParam handles it correctly
	swapKeys() {
		this.key1Signal.set('filter2');
		this.key2Signal.set('filter1');
		// Updates are coalesced and handled safely
	}
}
```

### Custom Injector

If you need to use `linkedQueryParam` in a context where dependency injection isn't available (like in `ngOnInit`), you can provide a custom injector:

```ts
import { Component, Injector, OnInit, inject } from '@angular/core';
import { linkedQueryParam } from 'ngxtension/linked-query-param';

@Component({
	template: ``,
})
export class MyComponent implements OnInit {
	private injector = inject(Injector);

	// Declare the property
	param!: ReturnType<typeof linkedQueryParam<string | null>>;

	ngOnInit() {
		// Create linkedQueryParam with custom injector
		this.param = linkedQueryParam('testParam', {
			injector: this.injector,
		});
	}
}
```

:::tip[When to Use Custom Injector]
Most of the time, you don't need a custom injector. Only use it when:

- Creating `linkedQueryParam` inside lifecycle hooks like `ngOnInit`
- You need a specific injector context for testing
- Working with complex dependency injection scenarios
  :::

### Advanced Usage Examples

#### Dynamic Key with Source Signal

This example shows how to create a dynamic search component where the search parameter key changes based on the search type:

```ts
@Component({
	template: `
		<select [(ngModel)]="searchType">
			<option value="search">Search</option>
			<option value="filter">Filter</option>
		</select>

		<input [(ngModel)]="searchValue" [placeholder]="'Enter ' + searchType" />

		<p>Current {{ searchType }}: {{ searchValue() }}</p>
	`,
})
export class DynamicSearchComponent {
	// Dynamic key based on search type
	readonly searchType = signal('search');
	readonly searchValue = signal<string | null>(null);

	// The query param key changes based on searchType
	readonly searchParam = linkedQueryParam(
		this.searchType, // Dynamic key
		{ source: this.searchValue }, // Source signal
	);
}
```

#### Model Signal Integration

This example shows how to use model signals for two-way binding:

```ts
@Component({
	template: `
		<input [(ngModel)]="pageModel" type="number" placeholder="Page number" />
		<p>Current page: {{ pageModel() }}</p>
	`,
})
export class PaginationComponent {
	// Model signal for two-way binding
	readonly pageModel = model<number>(1);

	// Link the model signal to a query parameter with number parsing
	readonly pageParam = linkedQueryParam('page', {
		source: this.pageModel,
		parse: paramToNumber({ defaultValue: 1 }),
	});
}
```

#### Multiple Parameters with Different Configurations

This example shows how to handle multiple query parameters with different configurations:

```ts
@Component({
	template: `
		<!-- Search with stringify transformation -->
		<input
			[(ngModel)]="search"
			placeholder="Search (will be uppercase in URL)"
		/>

		<!-- Page with number parsing -->
		<input [(ngModel)]="page" type="number" placeholder="Page" />

		<!-- Filter with boolean parsing -->
		<label>
			<input
				type="checkbox"
				[checked]="showHidden()"
				(change)="showHidden.set($event.target.checked)"
			/>
			Show hidden items
		</label>
	`,
})
export class AdvancedSearchComponent {
	// Search with custom stringify (uppercase in URL)
	readonly search = linkedQueryParam('search', {
		stringify: (value) => value?.toUpperCase() ?? null,
		parse: (value) => value?.toLowerCase() ?? null,
	});

	// Page with number parsing and default
	readonly page = linkedQueryParam('page', {
		parse: paramToNumber({ defaultValue: 1 }),
	});

	// Boolean filter with default
	readonly showHidden = linkedQueryParam('showHidden', {
		parse: paramToBoolean({ defaultValue: false }),
	});
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

## API Reference

### `linkedQueryParam<T>(key, options?)`

Creates a signal that is linked to a query parameter in the URL.

#### Parameters

- `key`: `QueryParamKeyType` - The query parameter key. Can be:

  - `string`: Static key name
  - `Signal<string | undefined>`: Dynamic key from a signal
  - `() => string | undefined`: Dynamic key from a function

- `options`: `LinkedQueryParamOptions<T>` (optional) - Configuration options

#### Returns

`WritableSignal<T>` - A writable signal that is linked to the query parameter

### `LinkedQueryParamOptions<T>`

Configuration options for the `linkedQueryParam` function.

```ts
interface LinkedQueryParamOptions<T> {
	/**
	 * The injector to use for dependency injection
	 */
	injector?: Injector;

	/**
	 * A comparison function which defines equality for signal values
	 */
	equal?: ValueEqualityFn<T>;

	/**
	 * The source signal to use for two-way binding
	 */
	source?: WritableSignal<T>;

	/**
	 * Controls whether the query param value should be synchronized
	 * with the source signal when the key changes
	 * @default true
	 */
	automaticallySynchronizeOnKeyChange?: boolean;

	/**
	 * Default value to use when the query parameter is not present
	 * Cannot be used together with `parse`
	 */
	defaultValue?: T | (() => T);

	/**
	 * Function to parse the query parameter value from string
	 */
	parse?: (value: string | null) => T;

	/**
	 * Function to stringify the value for the query parameter
	 */
	stringify?: (value: T) => string | number | boolean | null | undefined;

	// Navigation extras (from Angular Router)
	queryParamsHandling?: 'merge' | 'preserve' | '';
	onSameUrlNavigation?: 'reload' | 'ignore';
	replaceUrl?: boolean;
	skipLocationChange?: boolean;
	preserveFragment?: boolean;
}
```

### `provideLinkedQueryParamConfig(config)`

Provider function to configure default behavior for all `linkedQueryParam` instances.

#### Parameters

- `config`: `Partial<NavigateMethodFields>` - Configuration object with navigation extras

#### Returns

`Provider` - Angular provider for dependency injection

### `paramToNumber(config?)`

Creates a parser function for converting string query parameters to numbers.

#### Parameters

- `config`: `{ defaultValue?: number | null }` (optional) - Configuration object
  - `defaultValue`: Default value to return when parsing fails or param is not present

#### Returns

`(value: string | null) => number | null` - Parser function

### `paramToBoolean(config?)`

Creates a parser function for converting string query parameters to booleans.

#### Parameters

- `config`: `{ defaultValue?: boolean | null }` (optional) - Configuration object
  - `defaultValue`: Default value to return when param is not present

#### Returns

`(value: string | null) => boolean | null` - Parser function

## Type Definitions

### `QueryParamKeyType`

```ts
type QueryParamKeyType =
	| string
	| Signal<string | undefined>
	| (() => string | undefined);
```

### `ParseFn<T>` and `StringifyFn<T>`

```ts
type ParseFn<T> = (value: string | null) => T;
type StringifyFn<T> = (
	value: T,
) => string | number | boolean | null | undefined;
```

## Best Practices

1. **Use built-in parsers** when possible (`paramToNumber`, `paramToBoolean`, or Angular's `numberAttribute`) instead of custom parse functions for common types. They handle edge cases and provide consistent behavior.

2. **Prefer `parse` with default over `defaultValue`** when you need both parsing and default values, as `defaultValue` cannot be used together with `parse`.

3. **Convert input signals to writable** when using them as source. Use `linkedSignal()` to convert read-only input signals to writable signals.

4. **Configure globally** when you want consistent behavior across your application using `provideLinkedQueryParamConfig`.

5. **Handle null values appropriately** - setting a signal to `null` will remove the query parameter from the URL. This is useful for optional filters and search parameters.

6. **Use dynamic keys sparingly** - they add complexity and should only be used when the key truly needs to change at runtime. Consider if a static key with conditional logic might be simpler.

7. **Leverage coalescing** - Don't worry about performance when making multiple updates. All updates within the same task are automatically batched into a single navigation.

8. **Understand initialization order** - When using source signals, remember that URL values override initial signal values. If a query parameter exists in the URL, the source signal will be initialized with that value.

9. **Use `automaticallySynchronizeOnKeyChange: false`** when you need to change multiple dynamic keys atomically or avoid intermediate URL states.

10. **Test your implementations** - The function is designed to be testable with Angular's testing utilities. Use `RouterTestingHarness` for integration tests.

11. **Consider URL structure** - Query parameters are best for:

    - Filtering and search parameters
    - Pagination state
    - View preferences (sort order, view mode)
    - Sharing/bookmarking specific views

    Avoid storing sensitive data or complex nested objects in query parameters.
