---
title: mapSkipUndefined
description: An RxJS operator that allows applying a transform function to each value of the observable in (same as map), but with the ability to skip (filter out) some values if the function explicitly returns undefined or simply doesn't return anything for same code-path (implicit return undefined).
entryPoint: map-skip-undefined
badge: stable
contributors: ['daniele-morosinotto']
---

## Import

```ts
import { mapSkipUndefined } from 'ngxtension/map-skip-undefined';
```

## Uso

Se puede usar como un operador normal, pero con la habilidad de saltar ciertos valores: devolviendo undefined (explícito o implçicito).

```ts
import { from } from 'rxjs';
import { mapSkipUndefined } from 'ngxtension/map-skip-undefined';

const in$ = from([1, 42, 3]);
const out$ = in$.pipe(
	mapSkipUndefined((n) => {
		if (n % 2) return String(n * 2);
		//else revuelve undefined // <-- Es lo mismo que no devolver nada!
		//En cualquier caso, el valor par será filtrado
	}),
); //infer Observable<string>

out$.subscribe(console.log); // logs: 2, 6
```

## Bonus: filterUndefined

Si necesitamos filtrar los valores `undefined` de un stream Observable, podemos usar el operador `filterUndefined`.

### Ejemplo

```ts
import { filterUndefined } from 'ngxtension/map-skip-undefined';

const source$ = of(null, undefined, 42);
const filtered$ = source$.pipe(filterUndefined()); //solo emite null y 42
```
