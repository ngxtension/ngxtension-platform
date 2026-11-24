---
title: whenDocumentVisible
description: An RxJS operator that pauses a stream while the browser tab is hidden and restarts it when the tab becomes visible again.
entryPoint: ngxtension/when-document-visible
badge: stable
contributors: ['fabiendehopre']
---

`whenDocumentVisible` stops a stream when the user switches to another tab or app, and starts it again when they come back. Pair it with polling so you don't hit your API for a page nobody is looking at.

```txt
tab:      visible ─────── hidden ─────────── visible ───────
stream:   ● ● ● ● ● ●     (unsubscribed)     ● ● ● ● ● ●
```

## Usage

```angular-ts
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { poll } from 'ngxtension/poll';
import { whenDocumentVisible } from 'ngxtension/when-document-visible';

interface Notification {
	id: number;
	text: string;
}

@Component({
	selector: 'app-notifications',
	template: `
		@for (notification of notifications(); track notification.id) {
			<p>{{ notification.text }}</p>
		}
	`,
})
export class NotificationsComponent {
	readonly #http = inject(HttpClient);

	// Poll every 10 seconds, but only while the tab is visible.
	readonly notifications = toSignal(
		this.#http
			.get<Notification[]>('/api/notifications')
			.pipe(poll(10_000), whenDocumentVisible()),
		{ initialValue: [] },
	);
}
```

When the tab is hidden, the operator unsubscribes from the source. When it becomes visible again, it subscribes again. With `poll`, that means an immediate request on return, then the normal interval.

## Injection context

`whenDocumentVisible` reads `DOCUMENT` through Angular's injector, so call it in an injection context (a field initializer or constructor, as above). Elsewhere, pass an `injector`:

```ts
readonly #injector = inject(Injector);

startPolling() {
	return this.#http
		.get<Notification[]>('/api/notifications')
		.pipe(poll(10_000), whenDocumentVisible({ injector: this.#injector }));
}
```

You can also pass a custom `document`, for example an iframe's document or one in a test.

:::caution[Only use it on streams that don't complete]
When the source completes while the tab is visible, the operator subscribes to it again right away, and keeps doing so. On a plain `http.get(...)` that sends requests in a loop. Put it after `poll`, `interval` or another long-running stream, never directly on a single request.
:::

## API

```ts
function whenDocumentVisible<T>(
	options?: InjectDocumentVisibilityOptions,
): MonoTypeOperatorFunction<T>;
```

| Option     | Type       | Default            | Description                                   |
| ---------- | ---------- | ------------------ | --------------------------------------------- |
| `injector` | `Injector` | current injector   | Injector to use outside an injection context. |
| `document` | `Document` | `inject(DOCUMENT)` | The document whose visibility to watch.       |

## Related

- [`injectDocumentVisibility`](/utilities/browser-apis/inject-document-visibility/) gives you the visibility state as a signal, with the same options.
- [`poll`](/utilities/rxjs-operators/poll/) to re-run a request on an interval.
