---
title: createInjectionToken
description: Create an InjectionToken and return an injectFn and provideFn for it as well.
entryPoint: ngxtension/create-injection-token
badge: stable
contributors: ['chau-tran']
---

`createInjectionToken` creates an [`InjectionToken`](https://angular.dev/api/core/InjectionToken) from a factory function and returns a tuple of `[injectFn, provideFn, TOKEN, provideInitializerFn]`. Instead of writing `new InjectionToken(...)`, an `inject(TOKEN)` wrapper and a provider helper for every token, you get typed helpers for all of them in one call.

## Usage

```ts
import { Component, signal } from '@angular/core';
import { createInjectionToken } from 'ngxtension/create-injection-token';

function countFactory() {
	return signal(0);
}

export const [
	injectCount,
	/* provideCount */
	/* COUNT */
] = createInjectionToken(countFactory);

@Component({ selector: 'app-counter', template: '{{ count() }}' })
export class Counter {
	count = injectCount(); // WritableSignal<number>
	/* count = inject(COUNT); // WritableSignal<number> */
}
```

`injectFn` also accepts Angular's inject options, for example `injectCount({ optional: true })`, which returns `null` when the token isn't provided.

## Options

`createInjectionToken` accepts a second argument to customize the token:

```ts
type CreateInjectionTokenOptions = {
	isRoot?: boolean; // default: true
	deps?: [...]; // required when the factory has parameters, typed from them
	extraProviders?: Provider | EnvironmentProviders;
	multi?: boolean;
	token?: InjectionToken<ReturnType<TFactory>>;
	isFunctionValue?: boolean;
};
```

### `isRoot`

By default, `createInjectionToken` creates a `providedIn: 'root'` token, so you don't have to provide it anywhere to use it. To create a non-root token, pass `isRoot: false` and provide it with `provideFn()`.

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

### `deps`

When the factory has parameters, pass the tokens to inject for them in `deps`, in the same order. The types are checked against the factory's parameters.

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

You can also wrap a dep with modifiers, like `[new Optional(), new SkipSelf(), SOME_TOKEN]` (see [`token`](#token) below).

:::caution
For root tokens (the default), the factory gets its deps with a plain `inject()`, so modifiers such as `Optional` or `SkipSelf` are ignored. Use `isRoot: false` when you need them.
:::

### `extraProviders`

Use `extraProviders` for providers that should be registered together with the token. Calling `provideFn()` then provides them as well.

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
		// also provides provideState() and provideEffects()
		providers: [provideBookService()],
		loadComponent: () => import('./book/book.component'),
	},
];
```

### `multi`

Pass `multi: true` to create a multi token. Every `provideFn(value)` call adds one value, and `injectFn()` returns all of them as an array.

:::caution

- With `multi: true`, `injectFn()` returns an array.
- With `multi: true`, `isRoot` is ignored: multi tokens are always non-root, so you must call `provideFn`.

:::

```ts
const [injectFn, provideFn] = createInjectionToken(() => 1, { multi: true });

const values = injectFn(); // number[] instead of number

provideFn(2); // takes a single number, not an array
```

### `token`

To get `injectFn` and `provideFn` for an `InjectionToken` you already have, pass it as `token`.

One use case is a factory that depends on the same token, like a tree where a child service optionally has a parent service:

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

Passing `token` together with `isRoot: true` (the default) throws an error, so set `isRoot: false`.

### `isFunctionValue`

Sets the default for the second argument of `provideFn`. See [`provideFn`](#providefn).

## `createNoopInjectionToken`

`createNoopInjectionToken` works like `createInjectionToken` but takes a description and options instead of a factory. Use it when there is no sensible default value, typically for `multi` tokens. Pass the value type as a generic:

```ts
const [injectFn, provideFn] = createNoopInjectionToken<number, true>(
	'description',
	{ multi: true },
);

injectFn(); // number[]
provideFn(1); // accepts number
provideFn(() => 1); // accepts a factory returning a number;
```

:::tip
Pass `true` both as the second generic (`createNoopInjectionToken<number, true>`) and as `multi: true`. The generic is what lets TypeScript type `injectFn` as returning an array.
:::

It works for non-multi tokens too:

```ts
const [injectFn, provideFn] = createNoopInjectionToken<number>('description');
injectFn(); // number;
provideFn(1); // accepts number
provideFn(() => 1); // accepts a factory returning a number;
```

## `provideFn`

The `provideFn` returned by `createInjectionToken` and `createNoopInjectionToken` accepts a value or a **factory function** that returns the value. Called without arguments (only for `createInjectionToken`), it provides the token with its own factory and `deps`.

When the token's value is itself a function (like the validator functions in `NG_VALIDATORS`), `provideFn` can't tell a factory from a value. Pass a second argument to say which one it is:

```ts
const [injectFn, provideFn] = createInjectionToken(() => {
	// the value of this token is a function
	return (): number => 1;
});

// provides `() => 2` itself as the value
provideFn(() => 2, true);
// calls the outer function as a factory; its result is the value
provideFn(() => () => injectDepFn(), false);
```

By default, `provideFn` treats a function as a factory. Pass `true` as the second argument to provide the function as is (or set `isFunctionValue: true` in the options).

## Outside an injection context

`injectFn` accepts an `injector` option, so you can call it outside an injection context:

```ts
function countFactory() {
	return signal(1);
}

export const [injectCount] = createInjectionToken(countFactory);

@Component({ selector: 'app-counter', template: '' })
export class Counter implements OnInit {
	#injector = inject(Injector);

	ngOnInit() {
		const counter = injectCount({ injector: this.#injector });
	}
}
```

## Environment initializer

Root tokens are created lazily, the first time they're injected. To create one eagerly when the app starts (for example a token whose factory sets up a global listener), use the fourth item of the tuple. It provides an `ENVIRONMENT_INITIALIZER` that injects the token.

:::caution
For non-root tokens, the initializer provider function provides nothing.
:::

```ts
const [injectOne, , , provideOneInitializer] = createInjectionToken(() => 1);

bootstrapApplication(App, {
	providers: [provideOneInitializer()],
});
```

## API

```ts
function createInjectionToken<TFactory extends (...args: any[]) => any>(
	factory: TFactory,
	options?: CreateInjectionTokenOptions<TFactory>,
): [
	injectFn: InjectFn<ReturnType<TFactory>>, // array type when multi: true
	provideFn: ProvideFn,
	TOKEN: InjectionToken<ReturnType<TFactory>>,
	provideInitializerFn: () => Provider,
];

function createNoopInjectionToken<TValue, TMulti extends boolean = false>(
	description: string,
	options?: {
		multi?: TMulti;
		isFunctionValue?: boolean;
		extraProviders?: Provider | EnvironmentProviders;
	},
): [injectFn, provideFn, TOKEN, provideInitializerFn];
```

| Option            | Type                               | Default | Description                                                                              |
| ----------------- | ---------------------------------- | ------- | ---------------------------------------------------------------------------------------- |
| `isRoot`          | `boolean`                          | `true`  | Create a `providedIn: 'root'` token. Ignored (forced to `false`) when `multi` is `true`. |
| `deps`            | tokens matching the factory params |         | Tokens injected and passed to the factory. Required when the factory has parameters.     |
| `extraProviders`  | `Provider \| EnvironmentProviders` | `[]`    | Provided together with the token by `provideFn`.                                         |
| `multi`           | `boolean`                          | `false` | Create a multi token; `injectFn` returns an array.                                       |
| `token`           | `InjectionToken`                   |         | Use an existing token instead of creating one. Requires `isRoot: false`.                 |
| `isFunctionValue` | `boolean`                          | `false` | Default for `provideFn`'s second argument: treat a function as the value, not a factory. |

`injectFn(options?)` accepts Angular's `InjectOptions` (`optional`, `self`, `skipSelf`, `host`) plus `injector`.
