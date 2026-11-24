---
title: filterArray
description: An RxJS operator that filters the items of each array an Observable emits, like Array.prototype.filter inside map.
entryPoint: ngxtension/filter-array
badge: stable
contributors: ['thomas-laforge']
---

`filterArray` filters the items inside each array a stream emits. It's shorthand for `map((items) => items.filter(fn))`, which is a pattern you write often when an API returns a list.

```txt
[1, 2, 3, 4]  ──filterArray(n => n % 2 === 0)──▶  [2, 4]
```

## Usage

```ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { filterArray } from 'ngxtension/filter-array';

interface Todo {
	id: number;
	title: string;
	done: boolean;
}

@Injectable({ providedIn: 'root' })
export class TodoService {
	readonly #http = inject(HttpClient);

	getOpenTodos() {
		return this.#http
			.get<Todo[]>('/api/todos')
			.pipe(filterArray((todo) => !todo.done));
	}
}
```

The predicate also receives the item's index, just like `Array.prototype.filter`:

```ts
// Keep the first ten items
source$.pipe(filterArray((_, index) => index < 10));
```

It filters the items of an array. To drop whole emissions, use RxJS `filter`.

## API

```ts
function filterArray<T>(
	filterFn: (item: T, index: number) => boolean,
): OperatorFunction<T[], T[]>;
```

| Argument   | Type                                  | Description                                          |
| ---------- | ------------------------------------- | ---------------------------------------------------- |
| `filterFn` | `(item: T, index: number) => boolean` | Return `true` to keep the item in the emitted array. |

## Related

- [`mapArray`](/utilities/rxjs-operators/map-array/) and [`reduceArray`](/utilities/rxjs-operators/reduce-array/) for the other array methods.
