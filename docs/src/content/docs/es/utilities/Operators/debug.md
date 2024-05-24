---
title: debug
description: An RxJS operator that helps to debug what happens in an observable pipeline, it'll console.log all emitted values + final events (console.warn completed or console.error).
entryPoint: debug
badge: stable
contributors: ['daniele-morosinotto', 'sergi-dote']
---

## Import

```typescript
import { debug } from 'ngxtension/debug';
```

## Uso

Simplemente se tiene que añadir a nuestra pipeline un `tag` string y se imprimirán por consola todos los eventos.

```typescript
import { from, map } from 'rxjs';
import { debug } from 'ngxtension/debug';

const in$ = from([1, 2, 3]);
const out$ = in$.pipe(
	debug('before'),
	map((n) => {
		if (n > 2 && Math.random() < 0.9) return n * 2;
		else throw new Error('You WIN a Maybe error!');
	}),
	debug('after'),
);

out$.subscribe();
// LOGS:
//<timestampUTC> [before: Next] 1
//<timestampUTC> [after: Next] 2
//<timestampUTC> [before: Next] 2
//<timestampUTC> [after: Next] 4
//<timestampUTC> [before: Next] 3
// IF YOU ARE VERY LUCKY (<10%)
//<timestampUTC> [after: Error] You WIN a Maybe error!
// OR IF YOU ARE UNLUCKY (>90%)
//<timestampUTC> [after: Next] 6
//<timestampUTC> [before: Complete]
//<timestampUTC> [after: Complete]
```

Además de `tag` podemos también proporcionar notificaciones adicionales como `subscribe`, `unsubscribe` y `finalize`, pasando un objeto opcional, del tipo:

```ts
type ExtraNotifications = {
	subscribe?: boolean;
	unsubscribe?: boolean;
	finalize?: boolean;
};
```

```ts
const in$ = of('hello world');
const out$ = in$.pipe(debug('test', { subscribe: true }));

out$.subscribe();
// LOGS:
//<timestampUTC> [test: Subscribed]
//<timestampUTC> [test: Next] hello world
//<timestampUTC> [test: Completed]
```
