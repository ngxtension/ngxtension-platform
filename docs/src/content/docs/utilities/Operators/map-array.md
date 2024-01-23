---
title: mapArray
description: An RxJS operator designed to apply a map function to an array within an Observable stream, simplifying array transformations.
entryPoint: map-array
badge: stable
contributors: ['thomas-laforge']
---

## Import

```ts
import { mapArray } from 'ngxtension/map-array';
```

## Usage

### Basic

Apply a map function to an array emitted by an Observable.

```ts
import { of } from 'rxjs';
import { mapArray } from 'ngxtension/map-array';

const source$ = of([1, 2, 3]);
const transformed$ = source$.pipe(mapArray((e) => e + 1));
```

## Examples

### Example 1: Double Array Elements

```ts
const source$ = of([1, 2, 3]);
const transformed$ = source$.pipe(mapArray((e) => e * 2));
// Output: [2, 4, 6]
```

## API

### Inputs

- `mapFn: (item: T, index: number) => R` - A function to transform each element of the array, similar to JavaScript's `.map()` method.
