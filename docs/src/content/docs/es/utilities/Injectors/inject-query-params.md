---
title: injectQueryParams
description: ngxtension/inject-query-params
badge: stable
entryPoint: inject-query-params
contributors: ['enea-jahollari']
---

`injectQueryParams` es una función auxiliar que nos permite inyectar parámetros de la ruta actual como una signal.

Tener query params como una signal ayuda en una arquitectura moderna de signals basada en Angular.

```ts
import { injectQueryParams } from 'ngxtension/inject-query-params';
```

## Uso

`injectQueryParams` cuando se llama devuelve una signal con los query params de la ruta actual.

```ts
@Component({
	standalone: true,
	template: '<div>{{queryParams() | json}}</div>',
})
class TestComponent {
	queryParams = injectQueryParams();
}
```

Si queremos obtener el valor de un query param específico, podemos pasar el nombre del query param a `injectQueryParams`.

```ts
@Component({
	template: `
		Search results for: {{ searchParam() }}

		@for (user of filteredUsers()) {
			<div>{{ user.name }}</div>
		} @empty {
			<div>No users!</div>
		}
	`,
})
class TestComponent {
	searchParam = injectQueryParams('search'); // devuelve una signal con el valor del query param search

	filteredUsers = computedFrom(
		[this.searchParam],
		switchMap((searchQuery) =>
			this.userService.getUsers(searchQuery).pipe(startWith([])),
		),
	);
}
```

O si queremos transformar los query params, podemos pasar una función a `injectQueryParams`.

```ts
@Component()
class TestComponent {
	queryParamsKeys = injectQueryParams((params) => Object.keys(params)); // devuelve una signal con las keys de los query params de la ruta

	allQueryParamsArePassed = computed(() => {
		const keys = this.queryParamsKeys();
		return ['search', 'sort', 'page'].every((x) => keys.includes(x));
	});
}
```
