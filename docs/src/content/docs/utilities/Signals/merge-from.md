---
title: mergeFrom
description: ngxtension/merge-from
entryPoint: merge-from
badge: stable
contributors: ['chau-tran']
---

`mergeFrom` is a helper function that merges the values of `Observable`s or `Signal`s and emits the latest emitted value.
It also gives us the possibility to change the emitted value before emitting it using RxJS operators.

It is similar to `merge()`, but it also takes `Signals` into consideration.

From `ngxtension` perspective, `mergeFrom` is similar to [`computedFrom`](./computed-from.md), but it doesn't emit the combined value, but the latest emitted value by using the `merge` operator instead of `combineLatest`.

```ts
import { mergeFrom } from 'ngxtension/merge-from';
```

## Usage

`mergeFrom` accepts an array of `Observable`s or `Signal`s and returns a `Signal` that emits the latest value of the `Observable`s or `Signal`s.
By default, it needs to be called in an injection context, but it can also be called outside of it by passing the `Injector` in the third argument `options` object.
If your Observable doesn't emit synchronously, you can use the `startWith` operator to change the starting value, or pass an `initialValue` in the third argument `options` object.

```ts
const a = signal(1);
const b$ = new BehaviorSubject(2);

// array type
const merged = mergeFrom([a, b$]);
// both sources are sync, so emits the last emitted value
console.log(merged()); // 2
```

It can be used in multiple ways:

1. Merge multiple `Signal`s
2. Merge multiple `Observable`s
3. Merge multiple `Signal`s and `Observable`s
4. Using initialValue param
5. Use it outside of an injection context
