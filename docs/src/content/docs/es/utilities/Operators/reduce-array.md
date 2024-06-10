---
title: reduceArray
description: An RxJS operator designed to apply a reduce function to an array within an Observable stream, simplifying array transformations.
entryPoint: reduce-array
badge: stable
contributors: ['tomer']
---

## Import

```ts
import { reduceArray } from 'ngxtension/reduce-array';
```

## Uso

### Básico

Aplica una función de reducción a un array que ha sido emitido por un Observable.

```ts
import { of } from 'rxjs';
import { reduceArray } from 'ngxtension/reduce-array';

const source$ = of([1, 2, 3]);
const reduced$ = source$.pipe(reduceArray((acc, e) => acc + e, 0));
```

## Ejemplos

### Ejemplo 1: Suma de los elementos de un Array

```ts
const source$ = of([1, 2, 3]);
const reduced$ = source$.pipe(reduceArray((acc, e) => acc + e, 0));
// Output: 6
```

## API

### Inputs

- `reduceFn: (accumulator: R, item: T, index: number) => R` - Una función para reducir cada uno de los elementos del array, similar a la función de JavaScript `.reduce()`.
- `initialValue: R` - El valor inicial que se le asigna al acumulador.
