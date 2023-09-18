---
title: filterArray
description: ngxtension/filter-array
---

`filterArray` is an RxJS helper function designed for applying a filtering function to an array.

The following code:

```ts
const source$ = of([1, 2, 3]);
const filtered$ = source$.pipe(map((arr) => arr.filter((element) => element <= 2)));
```

can be simplified to:

```ts
const source$ = of([1, 2, 3]);
const filtered$ = source$.pipe(filterArray((element) => element <= 2));
```
