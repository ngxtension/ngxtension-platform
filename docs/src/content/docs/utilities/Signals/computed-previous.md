---
title: computedPrevious
description: ngxtension/computed-previous
entryPoint: computed-previous
badge: stable
contributor: enea-jahollari
---

`computedPrevious` is a helper function that returns a `signal` that emits the previous value of the passed `signal`. It's useful when you want to keep track of the previous value of a signal.
It will emit `null` as the previous value when the signal is first created.

```ts
import { computedPrevious } from 'ngxtension/computed-previous';
```

## Usage

`computedPrevious` accepts a `Signal` and returns a `Signal` that emits the previous value of the passed `Signal`.

```ts
const a = signal(1);
const b = computedPrevious(a);

console.log(b()); // null

a.set(2);
console.log(b()); // 1

a.set(3);
console.log(b()); // 2
```

## API

```ts
computedPrevious<T>(signal: Signal<T>): Signal<T | null>
```
