---
title: filterArray
description: An RxJS operator to simplify the process of filtering arrays within an Observable stream.
entryPoint: filter-array
badge: stable
contributor: thomas-laforge
---

## Import

```ts
import { filterArray } from 'ngxtension/filter-array';
```

## Usage

### Basic

Apply a filtering function to an array emitted by an Observable.

```ts
import { of } from 'rxjs';
import { filterArray } from 'ngxtension/filter-array';

const source$ = of([1, 2, 3]);
const filtered$ = source$.pipe(filterArray((element) => element <= 2));
```

## Examples

### Example 1: Filter Even Numbers

```ts
const source$ = of([1, 2, 3, 4, 5]);
const filtered$ = source$.pipe(filterArray((element) => element % 2 === 0));
```

## API

### Inputs

- `filterFn: (item: T, index: number) => boolean` - A function to filter the array, similar to JavaScript's `.filter()` method.
