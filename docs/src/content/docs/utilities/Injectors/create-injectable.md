---
title: createInjectable
description: A function based approach for creating Injectable services
entryPoint: create-injectable
badge: experimental
contributors: ['josh-morony', 'chau-tran']
---

`createInjectable` returns a class behind the scenes as a way to
create injectable services and other types of injectables in Angular without using classes and decorators.

The general difference is that rather than using a class, we use a `function` to
create the injectable. Whatever the function returns is what will be the
consumable public API of the service, everything else will be private.

### `providedIn`

By default, `createInjectable` returns a root service with `providedIn: 'root'`. You can override this by passing in a second argument to `createInjectable`:

- `scoped`: The service will be scoped to where it is provided in (i.e: `providers` array)
- `platform`: The service will be scoped to the platform (i.e: `platform-browser`). This is recommended if you create services that are used across multiple apps on the same platform.

### Non-root Service

```ts
// defining a service
export const MyService = createInjectable(
	() => {
		const myState = signal(1);
		return { myState: myState.asReadonly() };
	},
	{ providedIn: 'scoped' },
);
```

```ts
// provide the service
{
	providers: [MyService];
}
```

```ts
// using the service
const myService = inject(MyService);
```

### Root Service

```ts
// defining a root service
export const MyService = createInjectable(() => {
	const myState = signal(1);
	return { myState: myState.asReadonly() };
});
```

```ts
// using the service
const myService = inject(MyService);
```

### Using a named function

It is possible to use a named function as the `factory` instead of an arrow function. If a named function is used, the name of the function will be used as the name of the service constructor.

```ts
export const MyService = createInjectable(function MyService() {
	const myState = signal(1);
	return { myState: myState.asReadonly() };
});

console.log(MyService.name); // MyService
```
