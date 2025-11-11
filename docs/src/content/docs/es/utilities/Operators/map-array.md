---
title: mapArray
description: An RxJS operator designed to apply a map function to an array within an Observable stream, simplifying array transformations.
entryPoint: map-array
badge: stable
contributors: ['thomas-laforge', 'sergi-dote']
---

## Import

```ts
import { mapArray } from 'ngxtension/map-array';
```

## Uso

### Básico

Aplica una función de mapeo a un array, emitido por un Observable.

```ts
import { of } from 'rxjs';
import { mapArray } from 'ngxtension/map-array';

const source$ = of([1, 2, 3]);
const transformed$ = source$.pipe(mapArray((e) => e + 1));
```

## Ejemplos

### Ejemplo 1: Doble de los números que contiene un array

```ts
const source$ = of([1, 2, 3]);
const transformed$ = source$.pipe(mapArray((e) => e * 2));
// Salida: [2, 4, 6]
```

## API

### Inputs

- `mapFn: (item: T, index: number) => R` - La función de transformación que se aplica a cada elemento, similar al mismo método `.map()` JavaScript.
