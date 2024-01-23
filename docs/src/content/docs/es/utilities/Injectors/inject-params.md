---
title: injectParams
description: ngxtension/inject-params
badge: stable
entryPoint: inject-params
contributors: ['enea-jahollari']
---

`injectParams` es una función auxiliar que nos permite inyectar parámetros de la ruta actual como una signal.

Tener parámetros como una signal ayuda en una arquitectura moderna de signals basada en Angular.

```ts
import { injectParams } from 'ngxtension/inject-params';
```

## Uso

`injectParams` cuando se llama devuelve una signal con los parámetros de la ruta actual.

```ts
@Component({
	standalone: true,
	template: '<div>{{params() | json}}</div>',
})
class TestComponent {
	params = injectParams();
}
```

Si queremos obtener el valor de un parámetro específico, podemos pasar el nombre del parámetro a `injectParams`.

```ts
@Component({
	template: `
		@if (user()) {
			<div>{{ user.name }}</div>
		} @else {
			<div>No user!</div>
		}
	`,
})
class TestComponent {
	userId = injectParams('id'); // devuelve una signal con el valor del parámetro de ruta id

	user = computedFrom(
		[this.userId],
		switchMap((id) => this.userService.getUser(id).pipe(startWith(null))),
	);
}
```

O si queremos transformar los parámetros, podemos pasar una función a `injectParams`.

```ts
@Component()
class TestComponent {
	paramsKeys = injectParams((params) => Object.keys(params)); // devuelve una signal con las keys de los parámetros de la ruta
}
```
