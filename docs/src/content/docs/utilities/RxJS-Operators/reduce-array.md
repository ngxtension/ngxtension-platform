---
title: reduceArray
description: An RxJS operator that reduces each array an Observable emits to a single value, like Array.prototype.reduce inside map.
entryPoint: ngxtension/reduce-array
badge: stable
contributors: ['tomer']
---

`reduceArray` reduces each array a stream emits to a single value, such as a total or a lookup map. It's shorthand for `map((items) => items.reduce(fn, initialValue))`.

```txt
[1, 2, 3]  ──reduceArray((sum, n) => sum + n, 0)──▶  6
```

## Usage

```ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { reduceArray } from 'ngxtension/reduce-array';

interface CartItem {
	price: number;
	quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
	readonly #http = inject(HttpClient);

	readonly items$ = this.#http.get<CartItem[]>('/api/cart');

	readonly total$ = this.items$.pipe(
		reduceArray((total, item) => total + item.price * item.quantity, 0),
	);
}
```

Each array `items$` emits becomes one total on `total$`. The reducer also receives the item's index as its third argument.

## Without an initial value

You can leave out the initial value when the accumulator has the same type as the items. The first item is then used as the starting value, as with `Array.prototype.reduce`.

```ts
scores$.pipe(reduceArray((best, score) => Math.max(best, score)));
```

:::caution
Without an initial value, an empty array emits `undefined` instead of throwing like `[].reduce()` does. The return type doesn't include `undefined`, so pass an initial value whenever the array can be empty.
:::

## API

```ts
function reduceArray<T>(
	reduceFn: (acc: T, item: T, index: number) => T,
): OperatorFunction<T[], T>;

function reduceArray<T, R = T>(
	reduceFn: (acc: R, item: T, index: number) => R,
	initialValue: R,
): OperatorFunction<T[], R>;
```

| Argument       | Type                                    | Description                                  |
| -------------- | --------------------------------------- | -------------------------------------------- |
| `reduceFn`     | `(acc: R, item: T, index: number) => R` | Combines the accumulator with each item.     |
| `initialValue` | `R`                                     | Optional. Starting value of the accumulator. |

## Related

- [`mapArray`](/utilities/rxjs-operators/map-array/) and [`filterArray`](/utilities/rxjs-operators/filter-array/) for the other array methods.
