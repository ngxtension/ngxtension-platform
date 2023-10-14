---
title: mapSkipUndefined
description: An RxJS operator that allows applying a transform function to each value of the observable in (same as map), but with the ability to skip (filter out) some values if the function explicitly returns undefined or simply doesn't return anything for same code-path (implicit return undefined).
---

## Import

```ts
import { mapSkipUndefined } from 'ngxtension/map-skip-undefined';
```

## Usage

You can use it as a normal map operator, but with the ability to skip some values: returning undefined (explicit or implicit).

```ts
import { from } from 'rxjs';
import { mapSkipUndefined } from 'ngxtension/map-skip-undefined';

const in$ = from([1, 42, 3]);
const out$ = in$.pipe(
	mapSkipUndefined((n) => {
		if (n % 2) return String(n * 2);
		//else return undefined // <-- this is the same as not returning anything!
		//In either case the even value is filtered out
	})
); //infer Observable<string>

out$.subscribe(console.log); // logs: 2, 6
```

## Bonus: filterUndefined

If you need to filter out `undefined` value from and Observable stream you can use the `filterUndefined` operator.

### Example

```ts
import { filterUndefined } from 'ngxtension/map-skip-undefined';

const source$ = of(null, undefined, 42);
const filtered$ = source$.pipe(filterUndefined()); //emit only null and 42
```
