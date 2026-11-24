---
title: mapArray
description: An RxJS operator that maps the items of each array an Observable emits, like Array.prototype.map inside map.
entryPoint: ngxtension/map-array
badge: stable
contributors: ['thomas-laforge']
---

`mapArray` transforms every item inside each array a stream emits. It's shorthand for `map((items) => items.map(fn))`, handy for turning API DTOs into the shape your components need.

```txt
[1, 2, 3]  ──mapArray(n => n * 2)──▶  [2, 4, 6]
```

## Usage

```ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { mapArray } from 'ngxtension/map-array';

interface UserDto {
	id: number;
	first_name: string;
	last_name: string;
}

interface User {
	id: number;
	fullName: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
	readonly #http = inject(HttpClient);

	getUsers() {
		return this.#http.get<UserDto[]>('/api/users').pipe(
			mapArray(
				(dto): User => ({
					id: dto.id,
					fullName: `${dto.first_name} ${dto.last_name}`,
				}),
			),
		);
	}
}
```

The mapping function also receives the item's index:

```ts
source$.pipe(mapArray((name, index) => `${index + 1}. ${name}`));
```

## API

```ts
function mapArray<T, R>(
	mapFn: (item: T, index: number) => R,
): OperatorFunction<T[], R[]>;
```

| Argument | Type                            | Description                        |
| -------- | ------------------------------- | ---------------------------------- |
| `mapFn`  | `(item: T, index: number) => R` | Transforms each item of the array. |

## Related

- [`filterArray`](/utilities/rxjs-operators/filter-array/) and [`reduceArray`](/utilities/rxjs-operators/reduce-array/) for the other array methods.
