---
title: signalStore
description: ngxtension/signal-store
---

`signalStore` is extracted from [NgRx Signal Store playground](https://github.com/markostanimirovic/ngrx-signal-store-playground) to provide a way to manage a state object using [Angular Signals](https://angular.io/guide/signals)

:::tip[Credits]
[Marko Stanimirovic](https://twitter.com/MarkoStDev), NgRx Core teeam member, for his initiative (and effort) on Signal Store
:::

<!-- add caution for ngrx users when ngrx/signals is released -->
<!-- :::caution -->
<!-- If you are already using NgRx in your application, it is **recommended** to use these APIs from `@ngrx/signals` -->
<!-- ::: -->

## `signalStore`

```ts
import { signalStore } from 'ngxtension/signal-store';
```

### Usage

`signalStore` returns a store object with the following traits:

- Nested signals
  - Signals created by `signalStore` use `Object.is` for the equality function.
- `set` method to update the state
- `patch` method to apply _non undefined_ states.

```ts
export class MyComponent {
	store = signalStore({
		user: {
			firstName: 'chau',
			lastName: 'tran',
		},
		foo: 'bar',
		numbers: [1, 2, 3],
	});

	constructor() {
		this.store(); // { user: {firstName: 'chau', lastName: 'tran'}, foo: 'bar', numbers: [1, 2, 3]}
		this.store.snapshot; // { user: {firstName: 'chau', lastName: 'tran'}, foo: 'bar', numbers: [1, 2, 3]}

		this.store.user; // Signal<{firstName: string, lastName: string}>
		this.store.user(); // {firstName: 'chau', lastName: 'tran'}
		this.store.user.firstName(); // 'chau'
		this.store.numbers(); // [1, 2, 3]

		this.store.set({ foo: 'baz' }); // partial set state
		this.store.set((state) => ({ numbers: [...state.numbers, 4] })); // functional set state
	}
}
```

#### `patch` behavior

`patch` is an API that should be _rarely_ used. If a value passed in to `patch()` is `undefined`, then that value is skipped

```ts
export class MyComponent {
	store = signalStore({ foo: 1, bar: 2 });

	constructor() {
		this.store.foo(); // 1
		this.store.bar(); // 2

		this.store.patch({ foo: 3 });
		this.store.foo(); // 3

		this.store.patch({ foo: undefined, bar: 4 });
		this.store.foo(); // 3; `undefined` value is skipped
		this.store.bar(); // 4
	}
}
```

#### `untracked` state update

:::caution
This API is only for **advanced** use-case. If you are not sure why you need this API, do not use it.
:::

`signalStore`, by default, runs the update methods normally. However, there are cases where we need to run update methods inside of `untracked`. For example, when we need to update state inside of `effect()` and we are **sure** that our update operation does not cause any circular dependency.

If this is needed, we can use `provideUseUntracked(true)` to override the default behavior.

```ts
bootstrapApplication(AppComponent, {
	providers: [provideUseUntracked(true)],
});

export class MyComponent {
	store = signalStore({ foo: 'bar' });

	constructor() {
		effect(() => {
			// this should work now and won't need `allowSignalWrites: true`
			store.set({ foo: 'baz' });
		});
	}
}
```

This also applies to `snapshot`. By default, `snapshot` will be tracked as a dependency if used in `computed` or `effect`. `provideUseUntracked(true)` will exempt `snapshot` from being tracked.

Please note that this API is **advanced** and **optional**. If we need `untracked` behavior, we can always do so **explicitly**

```ts
untracked(() => this.store.snapshot);
untracked(() => this.store.set(/* .. */));
```

#### Injection Context

If we need to use `signalStore` outside of an Injection Context, we can use `signalStoreInjector()` for the 2nd argument of `signalStore`

```ts
const store = signalStore({ foo: 'bar' }, signalStoreInjector()); // signalStoreInjector(true) to switch to untracked behavior
```

## `selectSignal`

```ts
import { selectSignal } from 'ngxtension/signal-store';
```

### Usage

`selectSignal` is a utility that accepts one or more `Signal` with a `projectorFn` to return a computed `Signal`. The difference between `selectSignal` and `computed` is that `selectSignal` uses `Object.is` as the default equality function.

`selectSignal` also accepts `CreateComputedOptions` so we can override the default equality function as needed.

```ts
export class MyComponent {
	store = signalStore({
		firstName: 'chau',
		lastName: 'tran',
	});

	/* prettier-ignore */
	fullName = selectSignal(
    this.store.firstName, 
    this.store.lastName, 
    (firstName, lastName) => firstName + ' ' + lastName
  ); // Signal<string>
}
```
