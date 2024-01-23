---
title: repeat
description: An Angular directive extending NgFor to allow iteration over a fixed number of iterations.
entryPoint: repeat
badge: stable
contributors: ['chau-tran']
---

## Importa la directiva

```ts
import { Repeat } from 'ngxtension/repeat';
```

## Uso

### Básico

Utiliza la directiva `Repeat` como una extensión de `NgFor` de Angular para iterar sobre un número fijo de iteraciones. La [`TrackByFunction`](https://angular.io/api/core/TrackByFunction) se establece automáticamente para iterar de manera eficiente.

```ts
import { Component } from '@angular/core';
import { Repeat } from 'ngxtension/repeat';

@Component({
	imports: [Repeat],
	template: `
		<ul>
			<li *ngFor="let i; repeat: 3">{{ i }}</li>
		</ul>
	`,
})
export class App {}
```

Esto producirá el siguiente output:

```html
<!-- Output -->
<!-- <li>0</li> -->
<!-- <li>1</li> -->
<!-- <li>2</li> -->
```

## API

### Inputs

- `n: number` - Un entero no negativo, que especifica el número de iteraciones.

### Validación

- Un error se lanza si el `input` es negativo o no es un entero.
