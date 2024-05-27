---
title: filterArray
description: An RxJS operator to simplify the process of filtering arrays within an Observable stream.
entryPoint: filter-array
badge: stable
contributors: ['thomas-laforge', 'sergi-dote']
---

## Import

```ts
import { filterArray } from 'ngxtension/filter-array';
```

## Uso

### Básico

Aplica una función de filtrado a un array, emitido por un Observable.

```ts
import { of } from 'rxjs';
import { filterArray } from 'ngxtension/filter-array';

const source$ = of([1, 2, 3]);
const filtered$ = source$.pipe(filterArray((element) => element <= 2));
```

## Ejemplos

### Ejemplo 1: Filtrar números pares

```ts
const source$ = of([1, 2, 3, 4, 5]);
const filtered$ = source$.pipe(filterArray((element) => element % 2 === 0));
```

## API

### Inputs

- `filterFn: (item: T, index: number) => boolean` - Función para filtrar el array, similar a la función `.filter()` de JavaScript.
