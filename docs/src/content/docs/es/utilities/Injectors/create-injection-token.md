---
title: createInjectionToken
description: Crea un InjectionToken y devuelve un injectFn y provideFn para el mismo.
badge: stable
contributor: chau-tran
---

`createInjectionToken` es una abstacción sobre la creación de un [`InjectionToken`](https://angular.io/api/core/InjectionToken) y devuelve una tupla de `[injectFn, provideFn, TOKEN]`

Crear un `InjectionToken` no suele ser un gran problema, pero consumir el `InjectionToken` puede ser un poco tedioso si el proyecto utiliza `InjectionToken` mucho.

```ts
import { createInjectionToken } from 'ngxtension/create-injection-token';
```

## Uso

```ts
function countFactory() {
	return signal(0);
}

export const [
	injectCount,
	/* provideCount */
	/* COUNT */
] = createInjectionToken(countFactory);

@Component({})
export class Counter {
	count = injectCount(); // WritableSignal<number>
	/* count = inject(COUNT); // WritableSignal<number> */
}
```

### `CreateInjectionTokenOptions`

`createInjectionToken` acepta un segundo argumento de tipo `CreateInjectionTokenOptions` que permite personalizar el `InjectionToken` que estamos creando:

```ts
export interface CreateInjectionTokenOptions<T = unknown> {
	isRoot?: boolean;
	deps?: unknown[];
	extraProviders?: Provider[];
	multi?: boolean;
	token?: InjectionToken<T>;
}
```

#### `isRoot`

Por defecto, `createInjectionToken` crea un token `providedIn: 'root'` por lo que no tenemos que _proveerlo_ para usarlo. Para crear un token no-root, pasa `isRoot: false`

```ts
export const [injectCount, provideCount] = createInjectionToken(countFactory, {
	isRoot: false,
});

@Component({
	providers: [provideCount()],
})
export class Counter {
	count = injectCount(); // WritableSignal<number>
	/* count = inject(COUNT); // WritableSignal<number> */
}
```

#### `deps`

En muchos casos, `InjectionToken` puede depender de otros `InjectionToken`. Aquí es donde entran en juego `deps` y lo que podemos pasar en `deps` depende de la firma de `factoryFn` que acepta `createInjectionToken`.

```ts
export const [, , DEFAULT] = createInjectionToken(() => 5);

function countFactory(defaultValue: number) {
	return signal(defaultValue);
}

export const [injectCount, provideCount] = createInjectionToken(countFactory, {
	isRoot: false,
	deps: [DEFAULT],
});
```

#### `extraProviders`

También podemos pasar otros proveedores, a través de `extraProviders`, a `createInjectionToken` para que cuando llamemos a `provideFn()` proporcionemos esos proveedores también.

```ts
import { bookReducer } from './book.reducer';
import * as bookEffects from './book.effects';

export const [injectBookService, provideBookService] = createInjectionToken(
	() => {
		const store = inject(Store);
		/* ... */
	},
	{
		isRoot: false,
		extraProviders: [provideState('book', bookReducer), provideEffects(bookEffects)],
	},
);

// routes.ts
export const routes = [
	{
		path: 'book/:id',
		//          👇 también proporcionará provideState() y provideEffects
		providers: [provideBookService()],
		loadComponent: () => import('./book/book.component'),
	},
];
```

#### `multi`

Como el nombre sugiere, también podemos crear un `InjectionToken` multi a través de `createInjectionToken` pasando `multi: true` a `CreateInjectionTokenOptions`.

:::caution

- Cuando `multi: true`, el tipo de retorno se alterará.
- Cuando `multi: true`, la opcion `isRoot` se omitirá por completo. El `InjectionToken` se forzará a ser un token no-root.

:::

```ts
const [injectFn, provideFn] = createInjectionToken(() => 1, { multi: true });

const values = injectFn(); // number[] en vez de number

provideFn(value);
//        👆 esto AÚN acepta un número
```

#### `token`

Si tenemos un `InjectionToken` que queremos convertir en `injectFn` y `provideFn`, podemos pasar ese token, a través de `token`, a `createInjectionToken`.

Un caso de uso es si nuestra fábrica tiene una dependencia en el mismo `InjectionToken` (es decir, una estructura jerárquica en forma de árbol donde el `Service` hijo puede tener opcionalmente un `Service` padre)

```ts
export const SERVICE = new InjectionToken<TreeService>('TreeService');

function serviceFactory(parent: TreeService | null) {
	/* */
}

export const [injectService, provideService] = createInjectionToken(serviceFactory, {
	isRoot: false,
	deps: [[new Optional(), new SkipSelf(), SERVICE]],
	token: SERVICE,
});
```

Note que si se pasa `token` e `isRoot: true`, `createInjectionToken` lanzará un error.

### `createNoopInjectionToken`

Como su nombre sugiere, `createNoopInjectionToken` es lo mismo que `createInjectionToken` pero en lugar de una función fábrica, acepta una descripción y opciones. Esto es útil cuando queremos crear un token `multi` pero no tenemos una función fábrica.

También **admite un tipo genérico** para el `InjectionToken` que crea:

```ts
const [injectFn, provideFn] = createNoopInjectionToken<number, true>('descripción', { multi: true });

injectFn(); // number[]
provideFn(1); // acepta number
provideFn(() => 1); // acepta una fábrica que devuelve un número;
```

:::tip[Note]
Note **true** inside `createNoopInjectionToken<number, true>` and in `multi: true`. This is to help TypeScript to return the correct type for `injectFn` and `provideFn`
Note **true** dentro de `createNoopInjectionToken<number, true>` y en `multi: true`. Esto es para ayudar a TypeScript a devolver el tipo correcto para `injectFn` y `provideFn`
:::

Aunque está destinado a un token `multi`, también se puede utilizar para un token no-multi:

```ts
const [injectFn, provideFn] = createNoopInjectionToken<number>('descripción');
injectFn(); // number;
provideFn(1); // acepta number
provideFn(() => 1); // acepta una fábrica que devuelve un número;
```

## `ProvideFn`

`createInjectionToken` y `createNoopInjectionToken` devuelven un `provideFn` que es una función que acepta un valor o una **función fábrica** que devuelve el valor.

En el caso de que el valor del token sea una `Function` (es decir, `NG_VALIDATORS` es un token multi cuyos valores son funciones), `provideFn` acepta un segundo argumento para distinguir entre una **función fábrica** o una **función como valor**

```ts
const [injectFn, provideFn] = createInjectionToken(() => {
	// este token devuelve Function como valor
	return () => 1;
});

// NOTE: esto proporciona el valor de la función tal cual
provideFn(() => 2, true);
// NOTE: esto proporciona la función como una fábrica
provideFn(() => () => injectDepFn(), false);
```

Por defecto, `provideFn` tratará la función como una función fábrica. Si queremos proporcionar la función tal cual, necesitamos pasar `true` como segundo argumento.

## Inyector personalizado

La `injectFn` devuelta por `createInjectionToken` también acepta un `Injector` personalizado para permitir a los consumidores llamar a la `injectFn` fuera de un contexto de inyección.

```ts
function countFactory() {
	return signal(1);
}

export const [injectCount] = createInjectionToken(countFactory);

@Component()
export class Counter {
	#injector = inject(Injector);

	ngOnInit() {
		const counter = injectCount({ injector: this.#injector });
	}
}
```

## Environment Initializer

A veces, es necesario inicializar los tokens **root** en `ENVIRONMENT_INITIALIZER`. En lugar de proporcionar `ENVIRONMENT_INITIALIZER` manualmente, podemos recuperar la función proveedora del inicializador de `createInjectionToken` para hacerlo.

:::caution
El **proveedor de inicializador** es un **noop** para tokens no-root.
:::

```ts
const [injectOne /* omitir la fn */ /* omitir el token */, , , provideOneInitializer] = createInjectionToken(() => 1);

bootstrapApplication(App, {
	providers: [provideOneInitializer()],
});
```
