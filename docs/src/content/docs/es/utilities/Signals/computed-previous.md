---
title: computedPrevious
description: ngxtension/computed-previous
entryPoint: computed-previous
badge: stable
contributors: ['enea-jahollari']
---

`computedPrevious` es una función de utilidad que nos retorna un `signal` thatque emite el valor previo del `signal` proporcionado. Esta utilidad es útil cuando queremos tener un registro del valor previo de un signal.
Emite `null` como valor previo cuando el signal ha sido creado.

```ts
import { computedPrevious } from 'ngxtension/computed-previous';
```

## Usage

`computedPrevious` accepta un `Signal` y devuelve un `Signal` que emite el valor previo del `Signal` pasado por parámetro.

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
