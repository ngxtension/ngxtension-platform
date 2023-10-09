---
title: assertInjector
description: ngxtension/assert-injector
---

`assertInjector` is an extension of [`assertInInjectionContext`](https://angular.io/api/core/assertInInjectionContext) that accepts a `Function` and an optional custom `Injector`

`assertInjector` will assert that the `Function` is invoked in an [Injection Context](https://angular.io/guide/dependency-injection-context) and will return a **guaranteed** `Injector` whether it is the _custom_ one that is passed in or the _default_ one.

```ts
import { assertInjector } from 'ngxtension/assert-injector';
```

## Usage

`assertInjector` is mainly used for Custom Inject Functions (CIFs) or abstract functions that might depend on an Injection Context (i.e: `effect()` or `takeUntilDestroyed()`).

```ts
export function toSignal<T>(observable: Observable<T>, injector?: Injector): Signal<T> {
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

## Assert and run

`assertInjector` can also accept a `runner` which is a function that will be invoked in the Injection Context of the guaranteed `Injector` that it asserts. This usage shortens the CIF by not having to call `runInInjectionContext` explicitly.

```ts
export function toSignal<T>(observable: Observable<T>, injector?: Injector): Signal<T> {
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

### Retrieve the asserted `Injector`

Since the `runner` is invoked with the asserted `Injector` context, we can retrieve _that_ `Injector` with `inject(Injector)` in the `runner` body. For example, nested `effect()` might need the `Injector`

```ts
export function injectFoo(injector?: Injector) {
	return assertInjector(injectFoo, injector, () => {
		const assertedInjector = inject(Injector);

		// 👇 the outer effect automatically runs in the Injection Context
		effect(() => {
			/* do something for outer effect */
			effect(
				() => {
					/* do something for inner effect */
				},
				{ injector: assertedInjector }
			);
		});

		return 'foo';
	});
}
```
