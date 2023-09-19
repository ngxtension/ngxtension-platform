---
title: filterNil
description: An RxJS operator designed to filter out `undefined` and `null` values from an Observable stream, returning a strongly-typed value.
---

## Import

```ts
import { filterNil } from 'ngxtension/filter-nil';
```

## Usage

### Basic

Filter out `undefined` and `null` values from an Observable stream.

```ts
import { of } from 'rxjs';
import { filterNil } from 'ngxtension/filter-nil';

const source$ = of(undefined, null, 1, undefined);
const filtered$ = source$.pipe(filterNil());
```

## Examples

### Example 1: Removing Undefined and Null Values

```ts
const source$ = of(undefined, null, 1, 2, null);
const filtered$ = source$.pipe(filterNil());
// Output: 1, 2
```

## API

### Inputs

No inputs needed for this operator.
