---
title: createInjectable
description: A function based approach for creating Injectable services
entryPoint: create-injectable
badge: experimental
contributor: josh-morony
---

`createInjectable` returns a class behind the scenes as a way to
create injectable services and other types of injectables in Angular without using classes and decorators.

The general difference is that rather than using a class, we use a `function` to
create the injectable. Whatever the function returns is what will be the
consumable public API of the service, everything else will be private.

Pass `{ providedIn: 'root' }` to the 2nd argument of `createInjectable` if you want to create a root service.

## Usage

### Non-root Service

```ts
// defining a service
export const MyService = createInjectable(() => {
	const myState = signal(1);

	return { myState: myState.asReadonly() };
});
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
export const MyService = createInjectable(
	() => {
		const myState = signal(1);
		return { myState: myState.asReadonly() };
	},
	{ providedIn: 'root' },
);
```

```ts
// using the service
const myService = inject(MyService);
```
