---
title: mapArray
description: ngxtension/map-array
---

`mapArray` is an RxJs Helper function designed for applying a transform/map function to an array.

The following code:

```ts
const myObs = of([1, 2, 3]);
const myResultObs = myObs.pipe(map((arr) => arr.map((e) => e + 1)));
```

can be simplified to:

```ts
const myObs = of([1, 2, 3]);
const myResultObs = myObs.pipe(mapArray((e) => e + 1));
```
