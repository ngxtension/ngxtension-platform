---
title: reduceArray
description: An RxJS operator designed to apply a reduce function to an array within an Observable stream, simplifying array transformations.
badge: stable
contributor: Tomer953
---

## Import

```ts
import { reduceArray } from 'ngxtension/reduce-array';
```

## Usage

### Basic

Apply a reduce function to an array emitted by an Observable.

```ts
import { of } from 'rxjs';
import { reduceArray } from 'ngxtension/reduce-array';

const source$ = of([1, 2, 3]);
const reduced$ = source$.pipe(reduceArray((acc, e) => acc + e, 0));
```

## Examples

### Example 1: Sum Array Elements

```ts
const source$ = of([1, 2, 3]);
const reduced$ = source$.pipe(reduceArray((acc, e) => acc + e, 0));
// Output: 6
```

## API

### Inputs

- `reduceFn: (accumulator: R, item: T, index: number) => R` - A function to reduce each element of the array, similar to JavaScript's `.reduce()` method.
- `initialValue: R` - The initial value for the accumulator.
