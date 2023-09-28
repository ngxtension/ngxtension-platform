---
title: createInjectionToken
description: ngxtension/create-injection-token
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

#### `isRoot`

By default, `createInjectionToken` creates a `providedIn: 'root'` token so we do not have to _provide_ it anywhere in order to use it. To create a non-root token, pass in `isRoot: false`

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

Example TBD

#### `token`

If we already have an `InjectionToken` that we want to turn into `injectFn` and `provideFn`, we can pass that token, via `token`, to `createInjectionToken`.

One use-case is if our factory has a dependency on the same `InjectionToken` (i.e: a hierarchical tree-like structure where child `Service` might optionally have a parent `Service`)

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

Note that if `token` is passed in and `isRoot: true`, `createInjectionToken` will throw an error.

### Injector

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
