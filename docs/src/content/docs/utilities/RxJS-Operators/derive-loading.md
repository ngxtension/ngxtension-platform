---
title: deriveLoading
description: An RxJS operator that turns an async source into a loading flag that never flickers, for showing spinners only when a request is actually slow.
entryPoint: ngxtension/derive-loading
badge: stable
contributors: ['michael-berger']
---

`deriveLoading` turns an async source, such as an HTTP request, into a `boolean` loading flag for your spinner. Fast requests never show the spinner at all, and once it appears it stays long enough not to flash. You get a calm loading state without writing timers by hand.

## Usage

```angular-ts
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { shareReplay } from 'rxjs';
import { deriveLoading } from 'ngxtension/derive-loading';

interface Product {
	id: number;
	name: string;
}

@Component({
	selector: 'app-products',
	template: `
		@if (loading()) {
			<p>Loading…</p>
		}
		@for (product of products(); track product.id) {
			<p>{{ product.name }}</p>
		}
	`,
})
export class ProductsComponent {
	readonly #http = inject(HttpClient);

	// Share the request so the data and the loading flag don't trigger two calls.
	readonly #products$ = this.#http
		.get<Product[]>('/api/products')
		.pipe(shareReplay({ bufferSize: 1, refCount: true }));

	readonly products = toSignal(this.#products$, { initialValue: [] });
	readonly loading = toSignal(this.#products$.pipe(deriveLoading()), {
		initialValue: false,
	});
}
```

:::caution
`deriveLoading` subscribes to the source itself. If you also subscribe to the same source for its data, share it (with `shareReplay` or `share`) or the request runs twice.
:::

## How the flag behaves

The flag starts as `false`. With the defaults (`threshold: 500`, `loadingTime: 1000`):

```txt
request takes 200 ms    false ──────────────────────────────────────▶ (spinner never shows)
request takes 800 ms    false ── 500ms: true ── 1500ms: false ──────▶ (spinner shows for 1000 ms)
request takes 3000 ms   false ── 500ms: true ── 3000ms: false ──────▶ (spinner hides when data arrives)
```

- If the source emits before `threshold`, the flag stays `false`.
- Otherwise it switches to `true` at `threshold`, and back to `false` once the source has emitted **and** `threshold + loadingTime` has passed.

Only use it on async sources. For a synchronous source the flag stays `false`.

## Custom timings

```ts
this.#products$.pipe(deriveLoading({ threshold: 250, loadingTime: 500 }));
```

### App-wide defaults

There's no provider for default options. Wrap the operator in your own to share timings across the app:

```ts
import { OperatorFunction } from 'rxjs';
import { deriveLoading, DeriveLoadingOptions } from 'ngxtension/derive-loading';

export function appDeriveLoading<T>(
	options: DeriveLoadingOptions = { threshold: 250, loadingTime: 500 },
): OperatorFunction<T, boolean> {
	return deriveLoading<T>(options);
}
```

## API

```ts
function deriveLoading<T>(
	options?: DeriveLoadingOptions,
): OperatorFunction<T, boolean>;
```

| Option        | Type     | Default | Description                                                         |
| ------------- | -------- | ------- | ------------------------------------------------------------------- |
| `threshold`   | `number` | `500`   | Milliseconds to wait before emitting `true`.                        |
| `loadingTime` | `number` | `1000`  | Minimum milliseconds the flag stays `true` once it has switched on. |

:::note
The flag switches back to `false` when the source first **emits**, not when it completes. A source that completes without emitting leaves the flag `true`. If the source errors, the loading stream errors too, so handle errors with `catchError` before `deriveLoading` when you need the flag to recover.
:::

## Related

- Angular's [`resource` and `httpResource`](https://angular.dev/guide/signals/resource) expose an `isLoading()` signal when you fetch data with signals instead of RxJS.
