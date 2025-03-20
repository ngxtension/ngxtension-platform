---
title: createInjectable
description: Una aproximación basada en función para crear servicios inyectables
entryPoint: create-injectable
badge: experimental
contributors: ['josh-morony', 'chau-tran']
---

`createInjectable` devuelve una clase que permite create servicios y otro tipo de entidades inyectables en Angular sin usar clases ni decoradores.

La diferencia general es que, en lugar de usar una clase, usamos una `función` para crear el inyectable. Lo que sea que devuelve la función será la API pública consumible del servicio, mientras que cualquier otra cosa será de ámbito privado.

### `providedIn`

Por defecto, `createInjectable` devuelve un servicio "raíz" (root), con `providedIn: 'root'`. Se puede sobreescribir pasando un segundo argumento a `createInjectable`:

- `scoped`: El servicio pertenecerá al ámbito en el que ha sido provisto (por ejemplo: el array de `providers` )
- `platform`: El servicio pertenecerá al ámbito de la plataforma (por ejemplo: `platform-browser`). Es recomendado si creamos servicios que son usados en múltiples applicaciones dentro de la misma plataforma.

### Servicio no root

```ts
// definir el servicio
export const MyService = createInjectable(
	() => {
		const myState = signal(1);
		return { myState: myState.asReadonly() };
	},
	{ providedIn: 'scoped' },
);
```

```ts
// provisionar el servicio
{
	providers: [MyService];
}
```

```ts
// uso del servicio
const myService = inject(MyService);
```

### Servicio root

```ts
// definición del servicio root
export const MyService = createInjectable(() => {
	const myState = signal(1);
	return { myState: myState.asReadonly() };
});
```

```ts
// uso del servicio
const myService = inject(MyService);
```

### Usando una función con nombre

Es posible usar una función con nombre cómo `factoría`, en lugar de una función flecha. Si se usa una función con nombre, el nombre de la función será usado como el nombre del constructor del servicio.

```ts
export const MyService = createInjectable(function MyService() {
	const myState = signal(1);
	return { myState: myState.asReadonly() };
});

console.log(MyService.name); // MyService
```
