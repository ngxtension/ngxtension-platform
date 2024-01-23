---
title: createInjectionToken
description: Create an InjectionToken and return an injectFn and provideFn for it as well.
entryPoint: create-injection-token
badge: stable
contributors: ['chau-tran']
---

`createInjectionToken` is an abstraction over the creation of an [`InjectionToken`](https://angular.io/api/core/InjectionToken) and returns a tuple of `[injectFn, provideFn, TOKEN]`

Creating an `InjectionToken` is usually not a big deal but consuming the `InjectionToken` might be a bit of a chore/boilerplate if the project utilizes `InjectionToken` a lot.

```ts
import { createInjectionToken } from 'ngxtension/create-injection-token';
```

## Usage

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

`createInjectionToken` accepts a second argument of type `CreateInjectionTokenOptions` which allows us to customize the `InjectionToken` that we are creating:

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

By default, `createInjectionToken` creates a `providedIn: 'root'` token so we do not have to _provide_ it anywhere to use it. To create a non-root token, pass in `isRoot: false`

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

More than often, `InjectionToken` can depend on other `InjectionToken`. This is where `deps` come in and what we can pass in `deps` depends on the signature of the `factoryFn` that `createInjectionToken` accepts.

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

We can also pass in other providers, via `extraProviders`, to `createInjectionToken` so when we call `provideFn()`, we provide those providers as well.

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
		extraProviders: [
			provideState('book', bookReducer),
			provideEffects(bookEffects),
		],
	},
);

// routes.ts
export const routes = [
	{
		path: 'book/:id',
		//          👇 will also provideState() and provideEffects
		providers: [provideBookService()],
		loadComponent: () => import('./book/book.component'),
	},
];
```

#### `multi`

As the name suggested, we can also create a multi `InjectionToken` via `createInjectionToken` by passing `multi: true` to the `CreateInjectionTokenOptions`.

:::caution

- When `multi: true`, the return type will be altered.
- When `multi: true`, then `isRoot` option will be skipped entirely. The `InjectionToken` will be forced to be a non-root token.

:::

```ts
const [injectFn, provideFn] = createInjectionToken(() => 1, { multi: true });

const values = injectFn(); // number[] instead of number

provideFn(value);
//        👆 this STILL accepts a number
```

#### `token`

If we already have an `InjectionToken` that we want to turn into `injectFn` and `provideFn`, we can pass that token, via `token`, to `createInjectionToken`.

One use-case is if our factory has a dependency on the same `InjectionToken` (i.e: a hierarchical tree-like structure where child `Service` might optionally have a parent `Service`)

```ts
export const SERVICE = new InjectionToken<TreeService>('TreeService');

function serviceFactory(parent: TreeService | null) {
	/* */
}

export const [injectService, provideService] = createInjectionToken(
	serviceFactory,
	{
		isRoot: false,
		deps: [[new Optional(), new SkipSelf(), SERVICE]],
		token: SERVICE,
	},
);
```

Note that if `token` is passed in and `isRoot: true`, `createInjectionToken` will throw an error.

### `createNoopInjectionToken`

As the name suggested, `createNoopInjectionToken` is the same as `createInjectionToken` but instead of factory function, it accepts description and options. This is useful when we want to create a `multi` token but we do not have a factory function.

It also **supports a generic type** for the `InjectionToken` that it creates:

```ts
const [injectFn, provideFn] = createNoopInjectionToken<number, true>(
	'description',
	{ multi: true },
);

injectFn(); // number[]
provideFn(1); // accepts number
provideFn(() => 1); // accepts a factory returning a number;
```

:::tip[Note]
Note **true** inside `createNoopInjectionToken<number, true>` and in `multi: true`. This is to help TypeScript to return the correct type for `injectFn` and `provideFn`
:::

Even though it's meant for `multi` token, it can be used for non-multi token as well:

```ts
const [injectFn, provideFn] = createNoopInjectionToken<number>('description');
injectFn(); // number;
provideFn(1); // accepts number
provideFn(() => 1); // accepts a factory returning a number;
```

## `ProvideFn`

`createInjectionToken` and `createNoopInjectionToken` returns a `provideFn` which is a function that accepts either a value or a **factory function** that returns the value.

In the case where the value of the token is a `Function` (i.e: `NG_VALIDATORS` is a multi token whose values are functions), `provideFn` accepts a 2nd argument to distinguish between a **factory function** or a **function as value**

```ts
const [injectFn, provideFn] = createInjectionToken(() => {
	// this token returns Function as value
	return () => 1;
});

// NOTE: this is providing the function value as-is
provideFn(() => 2, true);
// NOTE: this is providing the function as a factory
provideFn(() => () => injectDepFn(), false);
```

By default, `provideFn` will treat the function as a factory function. If we want to provide the function as-is, we need to pass in `true` as the second argument.

## Custom Injector

The `injectFn` returned by `createInjectionToken` also accepts a custom `Injector` to allow the consumers to call the `injectFn`
outside of an Injection Context.

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

Sometimes, it is required for **root** tokens to be initialized in `ENVIRONMENT_INITIALIZER`. Instead of providing `ENVIRONMENT_INITIALIZER` manually, we can retrieve the initializer provider function from `createInjectionToken` to do so.

:::caution
The **initializer provider** function is a **noop** for non-root tokens.
:::

```ts
const [
	injectOne /* skip provider fn */ /* skip the token */,
	,
	,
	provideOneInitializer,
] = createInjectionToken(() => 1);

bootstrapApplication(App, {
	providers: [provideOneInitializer()],
});
```
