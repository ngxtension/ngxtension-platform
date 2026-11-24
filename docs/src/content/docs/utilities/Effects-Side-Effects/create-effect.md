---
title: createEffect
description: A standalone version of NgRx ComponentStore's effect, an RxJS pipeline you feed with values, observables or signals.
entryPoint: ngxtension/create-effect
badge: stable
contributors: ['chau-tran', 'evgeniy-oz']
---

`createEffect` is a standalone version of the [NgRx ComponentStore `effect`](https://ngrx.io/guide/component-store/effect). You describe a side effect as an RxJS pipeline once, and get back a function you can call with a plain value, an observable or a signal. Every value goes through the pipeline. The subscription is closed automatically when the component or service is destroyed, and by default the effect keeps working after an error.

## Usage

```angular-ts
import { Component, inject, Injectable } from '@angular/core';
import { createEffect } from 'ngxtension/create-effect';
import { Observable, of, switchMap, tap } from 'rxjs';

interface Product {
	id: string;
	name: string;
}

@Injectable({ providedIn: 'root' })
export class ProductsApi {
	load(categoryId: string): Observable<Product[]> {
		return of([{ id: '1', name: `Product in ${categoryId}` }]);
	}
}

@Component({
	selector: 'app-products',
	template: `
		<button (click)="loadProducts('books')">Books</button>
		<button (click)="loadProducts('games')">Games</button>
	`,
})
export class Products {
	private readonly api = inject(ProductsApi);

	readonly loadProducts = createEffect<string>((categoryId$) =>
		categoryId$.pipe(
			switchMap((categoryId) => this.api.load(categoryId)),
			tap((products) => console.log(products)),
		),
	);
}
```

Each click pushes a category id into `categoryId$`. Because the pipeline uses `switchMap`, a new click cancels the previous request.

## Call it with a value, an observable or a signal

The returned function accepts three kinds of input:

```ts
this.loadProducts('books'); // a single value
this.loadProducts(this.route.paramMap.pipe(map((p) => p.get('category')!))); // every emission
this.loadProducts(this.selectedCategory); // a signal: every change
```

Each call returns a `Subscription` for that input, so you can stop feeding one source without stopping the effect. All inputs are unsubscribed when the injector is destroyed.

If the type parameter is `void` (or omitted), call it with no argument: `refresh()`.

## Resubscribe on errors

By default, if the pipeline errors, `createEffect` resubscribes with the RxJS `retry()` operator, so one failed request doesn't kill the effect. Configure it with `retryOnError`:

```ts
// never resubscribe; the effect stops after the first error
readonly loadOnce = createEffect<string>(
	(id$) => id$.pipe(switchMap((id) => this.api.load(id))),
	{ retryOnError: false },
);

// resubscribe at most 3 times, waiting 500 ms between attempts
readonly loadWithRetry = createEffect<string>(
	(id$) => id$.pipe(switchMap((id) => this.api.load(id))),
	{ retryOnError: { count: 3, delay: 500 } },
);
```

Handling errors inside the pipeline (for example `catchError` inside the `switchMap`) is still the cleanest option when you want the effect to keep going and react to the error.

## Outside an injection context

`createEffect` uses `DestroyRef` to clean up, so it needs an injection context. Elsewhere, pass an `injector`:

```ts
private readonly injector = inject(Injector);

ngOnInit() {
	const log = createEffect<number>(
		(value$) => value$.pipe(tap((value) => console.log(value))),
		{ injector: this.injector },
	);

	log(interval(1000));
}
```

## API

```ts
function createEffect<T = void>(
	generator: (origin$: Observable<T>) => Observable<unknown>,
	options?: CreateEffectOptions,
): (observableOrValue: T | Observable<T> | Signal<T>) => Subscription;
// the argument is optional when T is void

type CreateEffectOptions = {
	injector?: Injector;
	retryOnError?: boolean | RetryConfig;
};
```

| Option         | Type                     | Default         | Description                                                                                      |
| -------------- | ------------------------ | --------------- | ------------------------------------------------------------------------------------------------ |
| `retryOnError` | `boolean \| RetryConfig` | `true`          | `true` resubscribes with `retry()`, `false` disables it, a `RetryConfig` is passed to `retry()`. |
| `injector`     | `Injector`               | current context | Needed outside an injection context.                                                             |

## Related

- [`rxEffect`](/utilities/effects-side-effects/rx-effect/) runs a side effect for one existing observable.
- [`explicitEffect`](/utilities/effects-side-effects/explicit-effect/) for side effects driven by signals.
