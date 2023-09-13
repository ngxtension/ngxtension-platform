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
