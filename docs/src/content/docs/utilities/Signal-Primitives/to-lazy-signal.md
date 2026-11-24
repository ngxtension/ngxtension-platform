---
title: toLazySignal
description: Like Angular's toSignal, but subscribes to the observable only when the signal is first read.
entryPoint: ngxtension/to-lazy-signal
badge: stable
contributors: ['evgeniy-oz']
---

`toLazySignal` works like Angular's `toSignal`, but it doesn't subscribe to the observable right away. It subscribes the first time the signal is read. If the signal is only used inside an `@if` or `@switch` branch that never renders, the request never happens.

## Usage

```angular-ts
import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toLazySignal } from 'ngxtension/to-lazy-signal';

interface Order {
	id: number;
	total: number;
}

@Component({
	selector: 'app-account',
	template: `
		<button (click)="showOrders.set(true)">Show orders</button>

		@if (showOrders()) {
			@for (order of orders(); track order.id) {
				<p>#{{ order.id }}: {{ order.total }}</p>
			}
		}
	`,
})
export class Account {
	private readonly http = inject(HttpClient);

	readonly showOrders = signal(false);

	// The request starts only when the @if branch first renders.
	readonly orders = toLazySignal(this.http.get<Order[]>('/api/orders'), {
		initialValue: [],
	});
}
```

`toLazySignal` takes the same arguments and options as `toSignal` (`initialValue`, `requireSync`, `injector` and the rest), so you can swap one for the other.

## Injection context and cleanup

Like `toSignal`, call it in an injection context (a constructor or field initializer) or pass an `injector` in the options. The injector is captured when you call `toLazySignal`, so a later first read works anywhere.

The subscription ends when that injector is destroyed: for a component, when the component is destroyed; for a service provided in a component, when that component is destroyed.

:::caution[Long-lived subscriptions]
In a `providedIn: 'root'` service or in the root component, the injector lives as long as the app, so the subscription is never closed. That is fine for streams that should live for the whole app, but for anything else it acts like a memory leak. Prefer creating these signals in components or component-level services.
:::

## API

```ts
function toLazySignal<T>(
	source: Observable<T> | Subscribable<T>,
	options?: ToSignalOptions<T> & { initialValue?: U },
): Signal<T | U>;
```

The overloads mirror `toSignal`, so the return type follows your options: `Signal<T | undefined>` by default, `Signal<T>` with `requireSync: true`, and `Signal<T | U>` with `initialValue: U`. See the [`toSignal` options](https://angular.dev/api/core/rxjs-interop/toSignal) for details.

## Related

- Angular's [`toSignal`](https://angular.dev/api/core/rxjs-interop/toSignal) subscribes immediately.
- [`toObservableSignal`](/utilities/signal-async/to-observable-signal/) gives you one value that is both a signal and an observable.
