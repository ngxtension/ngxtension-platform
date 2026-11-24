---
title: linkedQueryParam
description: A writable signal that is two-way bound to a URL query parameter, with parsing, defaults and batched navigation.
entryPoint: ngxtension/linked-query-param
badge: stable
contributors: ['enea-jahollari']
---

`linkedQueryParam` creates a writable signal that is linked to a query parameter in the URL. Reading the signal gives you the current value of the param, and setting it updates the URL. Your component state stays in sync with the URL, so every view can be shared and bookmarked.

Instead of manually reading from `ActivatedRoute.queryParams` and manually updating the router, `linkedQueryParam` gives you:

- **Two-way binding**: set the signal and the URL updates; navigate (or press back) and the signal updates.
- **Parsing and stringifying**: turn the URL string into a number, boolean or object, and back. Built-in parsers cover numbers and booleans.
- **Default values** for when the param is missing.
- **Batched navigation**: several updates in the same task produce a single `router.navigate()` call.
- **Navigation extras** such as `replaceUrl` or `skipLocationChange`, per signal or for a whole component or app.
- **Dynamic keys** and **source signals**: link a key that changes at runtime, or an existing `model()`/`signal()`, to the URL.

:::note[Use it inside a routed component]
`linkedQueryParam` reads the query params from the `ActivatedRoute` of the component that calls it. Use it in components that are rendered by a route. In the root component (usually `AppComponent`) the initial value is read before the first navigation.
:::

## Usage

```angular-ts
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { linkedQueryParam } from 'ngxtension/linked-query-param';

@Component({
	imports: [FormsModule],
	template: `
		<input [(ngModel)]="search" placeholder="Search" />
		<p>Searching for: {{ search() }}</p>
	`,
})
export class SearchComponent {
	readonly search = linkedQueryParam('search'); // WritableSignal<string | null>
}
```

Typing in the input updates `?search=` in the URL, and opening `/products?search=shoes` fills the input with `shoes`.

Add a `parse` function when the value isn't a string:

```angular-ts
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { linkedQueryParam } from 'ngxtension/linked-query-param';

@Component({
	imports: [FormsModule],
	template: `
		<label>
			Search:
			<input name="search" [(ngModel)]="searchQuery" />
		</label>

		<p>Page: {{ currentPage() }}</p>
		<button (click)="currentPage.set(currentPage() + 1)">Next page</button>
	`,
})
export class MyComponent {
	readonly searchQuery = linkedQueryParam('search');

	readonly currentPage = linkedQueryParam('page', {
		parse: (x) => parseInt(x ?? '1', 10),
	});
}
```

`parse` makes `currentPage` a `WritableSignal<number>` that falls back to `1` when the param is missing. Each click on "Next page" updates the URL to `?page=2`, `?page=3`, and so on.

## Parse and stringify

Use `parse` to turn the URL string (or `null` when the param is missing) into the value your signal holds, and `stringify` to turn the signal value back into a URL value. This is how you store booleans, numbers, objects and arrays in the URL. For numbers and booleans you can also use the [built-in parsers](#built-in-parsers).

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

:::tip
Write `stringify` after `parse` in the options object. TypeScript infers the signal type from `parse`, so this order gives you the right types.
:::

## Default values

Use `defaultValue` for the value the signal holds when the param is missing from the URL. Setting the signal to `null` later also falls back to the default.

```ts
sort = linkedQueryParam('sort', { defaultValue: 'name' }); // WritableSignal<string>
```

`defaultValue` accepts a function too, which is called each time the default is needed.

:::caution[`defaultValue` and `parse` can't be combined]
Passing both throws an error. `defaultValue` also does not convert the URL value: with `defaultValue: 1` and `?page=3` the signal holds the string `'3'`. For a number or boolean with a default, use `parse` and handle the missing value there, for example with `paramToNumber({ defaultValue: 1 })`.
:::

## Built-in parsers

`ngxtension/linked-query-param` exports two parser factories:

- `paramToNumber()` parses a number.
- `paramToBoolean()` parses a boolean.

Call them without arguments to get `T | null`, or with `{ defaultValue }` to get a non-null type.

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

### `paramToNumber`

`paramToNumber` converts the param with `parseInt(value, 10)`. A missing or invalid value gives `null`, or the `defaultValue` if you pass one.

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

### `paramToBoolean`

`paramToBoolean` treats the string `'true'` (case-sensitive) as `true` and any other value (including an empty string, `'false'` and `'0'`) as `false`. A missing param gives `null`, or the `defaultValue` if you pass one.

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

## Null and missing values

- **Param missing**: the signal holds `null`, unless you set a `defaultValue` or your `parse` returns something else.
- **Param present but empty** (`?search=`): the signal holds an empty string `''`.
- **Signal set to `null` or `undefined`**: the param is removed from the URL. With a `defaultValue`, the signal falls back to the default and the default is written to the URL instead.

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

## Batched updates

The signal value changes synchronously when you call `set()` or `update()`, but the URL is updated a moment later. All updates to `linkedQueryParam` signals in the same task are coalesced into a single `router.navigate()` call, so you don't trigger one navigation per change.

```ts
export class MyComponent {
	readonly page = linkedQueryParam('page');
	readonly search = linkedQueryParam('search');

	updateBoth() {
		// All three updates happen synchronously
		this.page.set('1');
		this.page.set('2');
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

## Navigation extras

`linkedQueryParam` updates the URL with `router.navigate([], { queryParams, ...extras })`. You can pass these navigation extras in the options, and they behave as they do on `router.navigate()`:

| Option                | Default   | Effect                                                                                                                                                 |
| --------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `queryParamsHandling` | `'merge'` | `'merge'` keeps the other query params. `''` replaces all query params with this one. `'preserve'` keeps the current params and ignores the new value. |
| `replaceUrl`          | `false`   | Replaces the current history entry instead of pushing a new one, so the back button skips intermediate values.                                         |
| `skipLocationChange`  | `false`   | Updates the router state without changing the browser URL or history. Back/forward won't restore earlier values.                                       |
| `preserveFragment`    | `false`   | Keeps the `#fragment` of the current URL.                                                                                                              |
| `onSameUrlNavigation` | router's  | `'reload'` or `'ignore'`.                                                                                                                              |

```ts
// Typing in a search box shouldn't create one history entry per keystroke
search = linkedQueryParam('search', { replaceUrl: true });
```

Because updates are batched, the extras of all signals updated in the same task are combined into one navigation.

### With `provideLinkedQueryParamConfig`

To set the same extras for every `linkedQueryParam` in a component (and its children) or in the whole app, use `provideLinkedQueryParamConfig`. It also accepts `automaticallySynchronizeOnKeyChange`.

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

Options passed to `linkedQueryParam` override the provided config. The nearest provided config wins as a whole: a component-level config replaces the app-level one, it is not merged with it.

```ts
// App config
provideLinkedQueryParamConfig({ preserveFragment: true });

// Component config: replaces the app config for this component
@Component({
	providers: [provideLinkedQueryParamConfig({ replaceUrl: true })],
})
export class MyComponent {
	// replaceUrl: true (preserveFragment is NOT inherited from the app config)
	readonly param1 = linkedQueryParam('param1');

	// replaceUrl: true, skipLocationChange: true
	readonly param2 = linkedQueryParam('param2', { skipLocationChange: true });
}
```

If you need both, repeat the app-level options in the component config.

## Dynamic keys

The key can be a string, a signal, or a function that reads signals. When the key changes, the old param is removed from the URL and the signal follows the new key (see [Synchronizing on key change](#synchronizing-on-key-change)).

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

:::caution[`input.required()` and `model.required()` can't be keys]
`linkedQueryParam` reads the key synchronously when the class is created, before required inputs are set, so a required input throws. A non-required `input()` or `model()` works, but the first read uses its initial value, not the value bound by the parent.
:::

## Source signals

Use the `source` option to link a signal you already have, such as a `model()` or a `signal()`, to a query param. Changes to the source update the URL, and URL changes update the source.

```ts
import { model, signal } from '@angular/core';
import { linkedQueryParam, paramToNumber } from 'ngxtension/linked-query-param';

export class SearchPage {
	// model() as source
	readonly page = model<number>(1);
	readonly pageParam = linkedQueryParam('page', {
		source: this.page,
		parse: paramToNumber({ defaultValue: 1 }),
	});
	// ?page=5 → page() === 5
	// no page param → page() === 1 (from paramToNumber's default)

	// signal() as source
	readonly filter = signal<string | null>(null);
	readonly filterParam = linkedQueryParam('filter', { source: this.filter });
	// ?filter=active → filter() === 'active'
	// no filter param → filter() === null
}
```

:::caution[Experimental]
`source` and `automaticallySynchronizeOnKeyChange` are marked `@experimental` in the source code.
:::

### Input signals

`input()` signals are read-only. Turn the input into a writable signal with `linkedSignal` and use that as the source:

```ts
import { input, linkedSignal } from '@angular/core';
import { linkedQueryParam } from 'ngxtension/linked-query-param';

export class SearchBox {
	readonly initialSearch = input<string>('');
	readonly search = linkedSignal(() => this.initialSearch());

	readonly searchParam = linkedQueryParam('search', { source: this.search });
}
```

### Model signals

`model()` signals are already writable, so the component, its parent and the URL all stay in sync:

```angular-ts
import { Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { linkedQueryParam, paramToNumber } from 'ngxtension/linked-query-param';

@Component({
	selector: 'app-pagination',
	imports: [FormsModule],
	template: `
		<input [(ngModel)]="page" type="number" />
		<p>Page: {{ page() }}</p>
	`,
})
export class Pagination {
	readonly page = model<number>(1);

	readonly pageParam = linkedQueryParam('page', {
		source: this.page,
		parse: paramToNumber({ defaultValue: 1 }),
	});
}
```

### Initial value

When the first effects run, `linkedQueryParam` overwrites the source once with the value from the URL. The initial value of your signal is not kept:

```ts
export class Example {
	readonly data = signal<string | null>('initial');
	readonly param = linkedQueryParam('data', { source: this.data });
	// URL has ?data=hello → data() === 'hello'
	// URL has no data param → data() === null

	readonly dataWithDefault = signal<string | null>('initial');
	readonly paramWithDefault = linkedQueryParam('other', {
		source: this.dataWithDefault,
		defaultValue: 'default',
	});
	// URL has no other param → dataWithDefault() === 'default'
}
```

To keep a fallback value, pass it as `defaultValue` or return it from `parse`, not as the signal's initial value. Because the source can be set to `null`, type it as `T | null` unless your `parse` never returns `null`.

## Synchronizing on key change

When you combine a dynamic key with a source signal, `automaticallySynchronizeOnKeyChange` decides what happens when the key changes:

- `true` (default): the old param is removed and the source's current value is written under the new key right away.
- `false`: nothing happens in the URL until the source changes next. Then the old param is removed and the new one is written. Use it to avoid an intermediate URL state while you change several things.

You can set it per signal or for all signals with `provideLinkedQueryParamConfig`.

```ts
export class SyncExample {
	readonly key = signal('search');
	readonly value = signal<string | null>(null);

	readonly param = linkedQueryParam(this.key, {
		source: this.value,
		automaticallySynchronizeOnKeyChange: true, // the default
	});

	example() {
		this.value.set('hello'); // URL: ?search=hello
		this.key.set('query'); // URL: ?query=hello
	}
}

export class NoSyncExample {
	readonly key = signal('param1');
	readonly value = signal<string | null>('value1');

	readonly param = linkedQueryParam(this.key, {
		source: this.value,
		automaticallySynchronizeOnKeyChange: false,
	});

	example() {
		// URL: ?param1=value1
		this.key.set('param2'); // URL unchanged: ?param1=value1
		this.value.set('value2'); // URL: ?param2=value2
	}
}
```

### Switching to a key that already has a value

Without a `source`, switching the key to a param that is already in the URL picks up its value:

```ts
export class ExistingKey {
	readonly key = signal('key1');
	readonly param = linkedQueryParam(this.key);

	example() {
		// URL: ?existingKey=existing-value
		this.key.set('existingKey');
		// param() === 'existing-value', URL unchanged
	}
}
```

## Several `linkedQueryParam` signals

Signals in the same component work independently, and updates made together are batched into one navigation.

```ts
export class Filters {
	readonly search = linkedQueryParam('search');
	readonly page = linkedQueryParam('page', {
		parse: paramToNumber({ defaultValue: 1 }),
	});
	readonly sort = linkedQueryParam('sort');

	resetFilters() {
		// One navigation: ?page=1&sort=name (search removed)
		this.search.set(null);
		this.page.set(1);
		this.sort.set('name');
	}
}
```

This also holds with dynamic keys, even when two signals swap keys in the same task:

```ts
export class SwapKeys {
	readonly key1 = signal('filter1');
	readonly key2 = signal('filter2');

	readonly param1 = linkedQueryParam(this.key1);
	readonly param2 = linkedQueryParam(this.key2);

	swapKeys() {
		this.key1.set('filter2');
		this.key2.set('filter1');
	}
}
```

## Outside an injection context

To create a `linkedQueryParam` in `ngOnInit` or another place without an injection context, pass an `injector`:

```ts
import {
	Component,
	inject,
	Injector,
	OnInit,
	type WritableSignal,
} from '@angular/core';
import { linkedQueryParam } from 'ngxtension/linked-query-param';

@Component({ template: `` })
export class MyComponent implements OnInit {
	private injector = inject(Injector);

	param!: WritableSignal<string | null>;

	ngOnInit() {
		this.param = linkedQueryParam('testParam', { injector: this.injector });
	}
}
```

Most of the time you don't need this: create the signal in a field initializer instead.

## More examples

### Dynamic key with a source signal

The param name follows a `<select>`, and the value follows an input:

```angular-ts
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { linkedQueryParam } from 'ngxtension/linked-query-param';

@Component({
	imports: [FormsModule],
	template: `
		<select [(ngModel)]="searchType">
			<option value="search">Search</option>
			<option value="filter">Filter</option>
		</select>

		<input [(ngModel)]="searchValue" [placeholder]="'Enter ' + searchType()" />

		<p>Current {{ searchType() }}: {{ searchValue() }}</p>
	`,
})
export class DynamicSearch {
	readonly searchType = signal('search');
	readonly searchValue = signal<string | null>(null);

	readonly searchParam = linkedQueryParam(this.searchType, {
		source: this.searchValue,
	});
}
```

### Several params with different parsers

```angular-ts
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
	linkedQueryParam,
	paramToBoolean,
	paramToNumber,
} from 'ngxtension/linked-query-param';

@Component({
	imports: [FormsModule],
	template: `
		<input [(ngModel)]="search" placeholder="Search (uppercase in the URL)" />
		<input [(ngModel)]="page" type="number" placeholder="Page" />
		<label>
			<input type="checkbox" [(ngModel)]="showHidden" />
			Show hidden items
		</label>
	`,
})
export class AdvancedSearch {
	// Lowercase in the signal, uppercase in the URL
	readonly search = linkedQueryParam('search', {
		parse: (value) => value?.toLowerCase() ?? null,
		stringify: (value) => value?.toUpperCase() ?? null,
	});

	readonly page = linkedQueryParam('page', {
		parse: paramToNumber({ defaultValue: 1 }),
	});

	readonly showHidden = linkedQueryParam('showHidden', {
		parse: paramToBoolean({ defaultValue: false }),
	});
}
```

### Todo list with template-driven forms and `rxResource`

Search, status, limit and page all live in the URL. The resource reloads whenever one of them changes.

```angular-ts
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { linkedQueryParam, paramToNumber } from 'ngxtension/linked-query-param';

@Component({
	selector: 'app-todos',
	template: `
		<form #ngForm="ngForm">
			<label>
				Search:
				<!--
					Update the URL on submit (Enter), not on every keystroke.
					Reset the page to 1 so a new search doesn't land on a page that doesn't exist.
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

## API

```ts
function linkedQueryParam<T = string>(
	key: QueryParamKeyType,
	options?: LinkedQueryParamOptions<T>,
): WritableSignal<T | null>;

type QueryParamKeyType =
	| string
	| Signal<string | undefined>
	| (() => string | undefined);
```

The return type depends on the options. Without `parse` or `defaultValue`, it is `WritableSignal<T | null>`. With a `parse` or a `defaultValue`, it is `WritableSignal<T>`, and `set()`/`update()` still accept `null` to remove the param. Passing both `parse` and `defaultValue` resolves to a `never` return type and throws at runtime.

| Option                                | Type                                                             | Default          | Description                                                                         |
| ------------------------------------- | ---------------------------------------------------------------- | ---------------- | ----------------------------------------------------------------------------------- |
| `parse`                               | `(value: string \| null) => T`                                   | `undefined`      | Converts the URL value (or `null` when missing) into the signal value.              |
| `stringify`                           | `(value: T) => string \| number \| boolean \| null \| undefined` | `String(value)`  | Converts the signal value into the URL value. `null`/`undefined` remove the param.  |
| `defaultValue`                        | `T \| (() => T)`                                                 | `undefined`      | Used when the param is missing, or when you set the signal to `null`. Not parsed.   |
| `source`                              | `WritableSignal<T>`                                              | `undefined`      | Experimental. An existing signal to keep in sync with the param.                    |
| `automaticallySynchronizeOnKeyChange` | `boolean`                                                        | `true`           | Experimental. Write the current value under the new key when a dynamic key changes. |
| `equal`                               | `ValueEqualityFn<T>`                                             | `Object.is`      | Equality function of the created signal.                                            |
| `injector`                            | `Injector`                                                       | `undefined`      | Use it when you call `linkedQueryParam` outside an injection context.               |
| `queryParamsHandling`                 | `'merge' \| 'preserve' \| ''`                                    | `'merge'`        | See [Navigation extras](#navigation-extras).                                        |
| `replaceUrl`                          | `boolean`                                                        | `false`          | See [Navigation extras](#navigation-extras).                                        |
| `skipLocationChange`                  | `boolean`                                                        | `false`          | See [Navigation extras](#navigation-extras).                                        |
| `preserveFragment`                    | `boolean`                                                        | `false`          | See [Navigation extras](#navigation-extras).                                        |
| `onSameUrlNavigation`                 | `'reload' \| 'ignore'`                                           | router's setting | See [Navigation extras](#navigation-extras).                                        |

### Helpers

```ts
// Default config for every linkedQueryParam in this injector (and its children)
function provideLinkedQueryParamConfig(
	config: Partial<NavigationExtrasFields> & {
		automaticallySynchronizeOnKeyChange?: boolean;
	},
): Provider;

// Parsers
function paramToNumber(): (value: string | null) => number | null;
function paramToNumber(config: {
	defaultValue: number;
}): (value: string | null) => number;

function paramToBoolean(): (value: string | null) => boolean | null;
function paramToBoolean(config: {
	defaultValue: boolean;
}): (value: string | null) => boolean;
```

`NavigationExtrasFields` stands for `queryParamsHandling`, `onSameUrlNavigation`, `replaceUrl`, `skipLocationChange` and `preserveFragment`.

## Best practices

- **Use the built-in parsers** (`paramToNumber`, `paramToBoolean`) for numbers and booleans. They handle missing and invalid values for you.
- **Put defaults in `parse`** when you need both, since `defaultValue` can't be combined with `parse`.
- **Set to `null` to remove a param.** That's the natural way to clear optional filters and search terms.
- **Use `replaceUrl: true` for inputs that change on every keystroke**, so the back button doesn't step through each character.
- **Configure once** with `provideLinkedQueryParamConfig` when a component or the whole app needs the same navigation extras.
- **Keep keys static** unless they really need to change at runtime. Dynamic keys are harder to reason about.
- **Don't worry about many updates at once.** Updates in the same task are batched into one navigation.
- **With `source`, the URL wins.** The source is overwritten with the URL value (or `null`/the default) once at start-up.
- **Keep the URL small and public.** Query params suit filters, search terms, pagination, sort order and view modes. Don't put sensitive data or large nested objects in them.
- **Test with `RouterTestingHarness`.** `linkedQueryParam` relies only on DI and the router, so it works in TestBed with `provideRouter`.

## Related

- [injectQueryParams](/utilities/router/inject-query-params/): read-only query params as a signal.
