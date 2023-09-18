---
title: mapArray
description: ngxtension/map-array
---

`mapArray` is a RxJs Helper function used when you need to execute a mapping function to map each element of an array.

The following code:

```ts
const myObs = of([1, 2, 3]);
const myResultObs = myObs.pipe(map((arr) => arr.map((e) => e + 1)));
```

becomes

```ts
const myObs = of([1, 2, 3]);
const myResultObs = myObs.pipe(mapArray((e) => e + 1));
```
