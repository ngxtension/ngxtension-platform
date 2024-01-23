---
title: injectAutoEffect
description: Una utilidad de Angular para crear un Effect auto-alambrado.
badge: stable
entryPoint: auto-effect
contributors: ['chau-tran']
---

`injectAutoEffect` es una CIF que devuelve un `Effect` _auto-alambrado_, por tanto el nombre `auto-effect`. Este `Effect` se puede usar en lugares que no tienen un Contexto de Inyección **implícito** como `ngOnInit` o `afterNextRender`.

```ts
import { injectAutoEffect } from 'ngxtension/auto-effect';
```

## Uso

```ts
@Component()
export class MyComponent {
	@Input({ required: true }) data!: Signal<Data>;

	private autoEffect = injectAutoEffect();

	constructor() {
		// Esto NO FUNCIONARÁ porque la entrada `data` aún no se ha resuelto
		effect(() => {
			console.log(this.data());
		});
	}

	ngOnInit() {
		// `data` Input no se resuelve hasta que se invoca `ngOnInit`
		this.autoEffect(() => {
			console.log(this.data());
		});
	}
}
```

### Función de limpieza

Un `effect()` normal puede opcionalmente invocar el argumento `onCleanup` para ejecutar alguna lógica de limpieza cada vez que se invoca el `Effect`.

```ts
effect((onCleanup) => {
	const sub = interval(1000).subscribe();
	onCleanup(() => sub.unsubscribe());
});
```

`injectAutoEffect()` permite a los consumidores **devolver** un `CleanUpFn` en su lugar. Esto es puramente preferencia y no tiene ningún efecto
en el rendimiento de `effect()`

```ts
const autoEffect = injectAutoEffect();
autoEffect(() => {
  const sub = interval(1000).subscribe():
  return () => sub.unsubscribe();
})
```

### Efecto Anidado

Para un `effect` normal, siempre necesitamos pasar el `Injector` al segundo parámetro de `effect()` anidado.

```ts
effect((onCleanup) => {
	const innerEffectRef = effect(
		() => {
			/* lógica de efecto interno */
		},
		{ manualCleanup: true, injector: injector },
	);
	onCleanup(() => innerEffectRef.destroy());
});
```

Con `injectAutoEffect()`, `autoEffect` siempre se invocará con el `Injector` inicial (donde invocamos `injectAutoEffect()`).

```ts
const autoEffect = injectAutoEffect();
autoEffect(() => {
	const innerEffectRef = autoEffect(
		() => {
			/* lógica de efecto interno */
		},
		{ manualCleanup: true },
	);
	return () => innerEffectRef.destroy();
});
```

Opcionalmente, el callback `autoEffect` expone el `Injector` para que los consumidores puedan usarlo si es necesario..

```ts
const autoEffect = injectAutoEffect();
autoEffect((injector) => {
	/* do something */
});
```
