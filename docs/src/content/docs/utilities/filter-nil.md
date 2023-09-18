---
title: filter nil RxJs operator
description: ngxtension/filter-nil
---

`filterNil` is a RxJs Helper function used to filter `undefined` and `null` value inside an observable. This operator return a strongly typed value without `undefined` and `null` Type.

The following code:

```ts
const myObs = of(undefined, null, 1, undefined);
const myResultObs = myObs.pipe(filter(e => e !== undefined && e !== null));
      ^? number | undefined | null
```

becomes

```ts
const myObs = of(undefined, null, 1, undefined);
const myResultObs = myObs.pipe(filterNil());
      ^? number
```
