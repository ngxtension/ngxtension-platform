---
title: filterArray
description: ngxtension/filter-array
---

`filterArray` is a RxJs Helper function used when you need to execute a filtering function on an array.

The following code:

```ts
const myObs = of([1, 2, 3]);
const myResultObs = myObs.pipe(map((arr) => arr.filter((e) => e <= 2)));
```

becomes

```ts
const myObs = of([1, 2, 3]);
const myResultObs = myObs.pipe(fitlerArray((e) => e <= 1));
```
