---
title: filterNil
description: ngxtension/filter-nil
---

`filterNil` is an RxJS helper function designed to filter out `undefined` and `null` values from an observable. This operator returns a strongly-typed value, excluding `undefined` and `null`.

The following code:

```ts
const source$ = of(undefined, null, 1, undefined);
const filtered$ = source$.pipe(filter((e) => e !== undefined && e !== null));
// Output: 1
// Type: Observable<number | undefined | null>
```

can be simplified to:

```ts
const source$ = of(undefined, null, 1, undefined);
const filtered$ = source$.pipe(filterNil());
// Output: 1
// Type: Observable<number>
```
