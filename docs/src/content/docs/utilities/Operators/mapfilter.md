---
title: mapFilter
description: An RxJS operator that allows applying a transform function to each value of the observable in (same as map), but with the ability to skip (filter out) some values if the function explicitly returns undefined or simply doesn't return anything for same code-path (implicit return undefined).
---

## Import

```typescript
import { mapFilter } from 'ngxtension/mapfilter';
```

## Usage

You can use it as a normal map operator, but with the ability to skip some values: returning undefined (explicit or implicit).

```typescript
import { from } from 'rxjs';
import { mapFilter } from 'ngxtension/mapfilter';

const in$ = from([1, 42, 3]);
const out$ = in$.pipe(
	mapFilter((n) => {
		if (n % 2) return String(n * 2);
		//else return undefined // <-- this is the same as not returning anything! In either case the even value is filtered out
	})
); //infer Observable<string>

out$.subscribe(console.log); // logs: 2, 6
```
