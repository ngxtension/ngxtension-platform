---
title: assertInjector
description: Una utilidad de Angular para afirmar que una función se invoca en un contexto de inyección y devolver el Injector garantizado.
badge: stable
entryPoint: assert-injector
contributor: chau-tran
---

`assertInjector` es una extensión de [`assertInInjectionContext`](https://angular.io/api/core/assertInInjectionContext) que acepta una `Function` y un `Injector` personalizado opcional.

`assertInjector` afirmará que la `Function` se invoque en un [Contexto de Inyección](https://angular.io/guide/dependency-injection-context) y devolverá un `Injector` **garantizado** ya sea el _personalizado_ que se pasa o el _predeterminado_.

```ts
import { assertInjector } from 'ngxtension/assert-injector';
```

## Uso

`assertInjector` se usa principalmente para las funciones de inyección personalizadas (CIF) o funciones abstractas que pueden depender de un Contexto de Inyección (como: `effect()` o `takeUntilDestroyed()`).

```ts
export function toSignal<T>(
	observable: Observable<T>,
	injector?: Injector,
): Signal<T> {
	injector = assertInjector(toSignal, injector);
	return runInInjectionContext(injector, () => {
		const source = signal<T>(undefined!);

		effect((onCleanup) => {
			const sub = observable.subscribe((value) => {
				source.set(value);
			});
			onCleanup(() => sub.unsubscribe());
		});

		return source.asReadonly();
	});
}
```

## Afirmar y ejecutar

`assertInjector` también puede aceptar un `runner` que es una función que se invocará en el contexto de inyección del `Injector` garantizado que afirma. Este uso acorta el CIF al no tener que llamar explícitamente a `runInInjectionContext`.

```ts
export function toSignal<T>(
	observable: Observable<T>,
	injector?: Injector,
): Signal<T> {
	return assertInjector(toSignal, injector, () => {
		const source = signal<T>(undefined!);

		effect((onCleanup) => {
			const sub = observable.subscribe((value) => {
				source.set(value);
			});
			onCleanup(() => sub.unsubscribe());
		});

		return source.asReadonly();
	});
}
```

### Recuperar el `Injector` afirmado

Como el `runner` se invoca con el contexto del `Injector` afirmado, podemos recuperar _ese_ `Injector` con `inject(Injector)` en el cuerpo del `runner`. Por ejemplo, un `effect()` anidado podría necesitar el `Injector`.

```ts
export function injectFoo(injector?: Injector) {
	return assertInjector(injectFoo, injector, () => {
		const assertedInjector = inject(Injector);

		// 👇 el efecto externo se ejecuta automáticamente en el Contexto de Inyección
		effect(() => {
			/* hacer algo para el efecto externo */
			effect(
				() => {
					/* hacer algo para el efecto interno */
				},
				{ injector: assertedInjector },
			);
		});

		return 'foo';
	});
}
```
