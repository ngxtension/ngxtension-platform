---
title: assertInjector
description: Assert an injection context or use a custom Injector, for writing your own inject functions.
entryPoint: ngxtension/assert-injector
badge: stable
contributors: ['chau-tran']
---

`assertInjector` is a building block for your own inject functions (often called Custom Inject Functions, or CIFs). It extends Angular's [`assertInInjectionContext`](https://angular.dev/api/core/assertInInjectionContext): if the caller passed an `Injector`, it uses that one; otherwise it asserts that the function runs in an [injection context](https://angular.dev/guide/di/dependency-injection-context) and returns the current `Injector`. Either way, you get a guaranteed `Injector` back.

Most ngxtension `inject*` utilities use it to support an optional `injector` argument.

## Usage

Accept an optional `injector`, assert it, then run your code in that injector's context:

```ts
import {
	effect,
	Injector,
	runInInjectionContext,
	signal,
	type Signal,
} from '@angular/core';
import { assertInjector } from 'ngxtension/assert-injector';
import type { Observable } from 'rxjs';

export function signalFromObservable<T>(
	observable: Observable<T>,
	injector?: Injector,
): Signal<T | undefined> {
	injector = assertInjector(signalFromObservable, injector);

	return runInInjectionContext(injector, () => {
		const source = signal<T | undefined>(undefined);

		effect((onCleanup) => {
			const sub = observable.subscribe((value) => source.set(value));
			onCleanup(() => sub.unsubscribe());
		});

		return source.asReadonly();
	});
}
```

Called in a field initializer or constructor, it uses the component's injector. Called anywhere else without an `injector`, it throws Angular's "must be called from an injection context" error, which names `signalFromObservable` so the message points to your function.

## Assert and run

Pass a `runner` function as the third argument to skip the `runInInjectionContext` call. `assertInjector` runs it in the asserted injector's context and returns its result.

```ts
export function signalFromObservable<T>(
	observable: Observable<T>,
	injector?: Injector,
): Signal<T | undefined> {
	return assertInjector(signalFromObservable, injector, () => {
		const source = signal<T | undefined>(undefined);

		effect((onCleanup) => {
			const sub = observable.subscribe((value) => source.set(value));
			onCleanup(() => sub.unsubscribe());
		});

		return source.asReadonly();
	});
}
```

### Get the asserted `Injector`

Inside the `runner`, `inject(Injector)` returns the asserted injector. Keep a reference to it when your function returns callbacks that run later, outside the injection context, and still need DI:

```ts
import { afterNextRender, ElementRef, inject, Injector } from '@angular/core';
import { assertInjector } from 'ngxtension/assert-injector';

export function injectFocus(injector?: Injector) {
	return assertInjector(injectFocus, injector, () => {
		const assertedInjector = inject(Injector);
		const host = inject<ElementRef<HTMLElement>>(ElementRef);

		return {
			// called later, e.g. from a click handler
			focusAfterRender: () =>
				afterNextRender(() => host.nativeElement.focus(), {
					injector: assertedInjector,
				}),
		};
	});
}
```

## API

```ts
function assertInjector(
	fn: Function,
	injector: Injector | undefined | null,
): Injector;

function assertInjector<Runner extends () => any>(
	fn: Function,
	injector: Injector | undefined | null,
	runner: Runner,
): ReturnType<Runner>;
```

| Parameter  | Type                            | Description                                                                      |
| ---------- | ------------------------------- | -------------------------------------------------------------------------------- |
| `fn`       | `Function`                      | Your function. Its name appears in the error when there is no injection context. |
| `injector` | `Injector \| undefined \| null` | The injector passed by the caller. When it is set, no assertion is made.         |
| `runner`   | `() => any`                     | Optional. Runs in the asserted injector's context; its return value is returned. |

## Related

- [createInjectionToken](/utilities/dependency-injection/create-injection-token/): its `injectFn` uses `assertInjector` to accept an `injector` option.
