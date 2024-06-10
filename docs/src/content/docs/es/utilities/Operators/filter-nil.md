---
title: filterNil
description: An RxJS operator designed to filter out `undefined` and `null` values from an Observable stream, returning a strongly-typed value.
entryPoint: filter-nil
badge: stable
contributors: ['thomas-laforge', 'sergi-dote']
---

## Import

```ts
import { filterNil } from 'ngxtension/filter-nil';
```

## Uso

### Básico

Filtra los valores `undefined` y `null` de un stream Observable.

```ts
import { of } from 'rxjs';
import { filterNil } from 'ngxtension/filter-nil';

const source$ = of(undefined, null, 1, undefined);
const filtered$ = source$.pipe(filterNil());
```

## Ejemplos

### Ejemplo 1: Eliminar valores Undefined y Null

```ts
const source$ = of(undefined, null, 1, 2, null);
const filtered$ = source$.pipe(filterNil());
// Salida: 1, 2
```

## API

### Inputs

No se requiere ningún input para este operador.
