---
title: mapSkipUndefined
description: An RxJS operator that maps each value like map, but drops the emission when the mapping function returns undefined, so you can map and filter in one step.
entryPoint: ngxtension/map-skip-undefined
badge: stable
contributors: ['daniele-morosinotto']
---

`mapSkipUndefined` works like RxJS `map`, except that any value your function maps to `undefined` is dropped. Return `undefined` for the values you want to skip, and you map and filter in one step. The output type excludes `undefined`.

```txt
1, 42, 3  ──mapSkipUndefined(n => n % 2 ? n * 2 : undefined)──▶  2, 6
```

## Usage

```ts
import { inject, Injectable } from '@angular/core';
import { ActivationEnd, Router } from '@angular/router';
import { mapSkipUndefined } from 'ngxtension/map-skip-undefined';

@Injectable({ providedIn: 'root' })
export class PageTitleService {
	readonly #router = inject(Router);

	// Emits the `title` from route data, skipping events and routes without one.
	readonly title$ = this.#router.events.pipe(
		mapSkipUndefined((event) => {
			if (event instanceof ActivationEnd) {
				return event.snapshot.data['title'] as string | undefined;
			}
			return undefined; // skipped
		}),
	);
}
```

`title$` is typed `Observable<string>`. Only `undefined` is skipped; `null` passes through.

:::note
A function that doesn't return on some paths also returns `undefined`, so those values are skipped too. Angular projects turn on `noImplicitReturns` by default, which rejects that pattern, so write `return undefined` explicitly as above.
:::

## filterUndefined

The same entry point exports `filterUndefined`, which drops only `undefined` and keeps `null`. Use [`filterNil`](/utilities/rxjs-operators/filter-nil/) to drop both.

```ts
import { of } from 'rxjs';
import { filterUndefined } from 'ngxtension/map-skip-undefined';

of(null, undefined, 42).pipe(filterUndefined()); // emits null, 42
```

## API

```ts
function mapSkipUndefined<T, R>(
	fn: (value: T) => R,
): OperatorFunction<T, Exclude<R, undefined>>;

function filterUndefined<T>(): OperatorFunction<T, Exclude<T, undefined>>;
```

| Argument | Type              | Description                                                  |
| -------- | ----------------- | ------------------------------------------------------------ |
| `fn`     | `(value: T) => R` | Maps each value. Return `undefined` (or nothing) to skip it. |

Unlike `map`, the mapping function doesn't receive the index.
