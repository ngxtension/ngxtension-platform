---
title: poll
description: An RxJS operator that re-runs a source, such as an HTTP request, every N milliseconds after an optional initial delay.
entryPoint: ngxtension/poll
badge: stable
contributors: ['fabiendehopre']
---

`poll` re-subscribes to a source on a fixed interval, which is what you want to keep data fresh by calling an API every few seconds. You choose the period and, optionally, how long to wait before the first call.

```txt
poll(10_000, 5_000):   5s: request ── 15s: request ── 25s: request ── …
```

## Usage

```angular-ts
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { poll } from 'ngxtension/poll';

interface Status {
	healthy: boolean;
	message: string;
}

@Component({
	selector: 'app-status',
	template: `<p>{{ status()?.message ?? 'Checking…' }}</p>`,
})
export class StatusComponent {
	readonly #http = inject(HttpClient);

	// Call the API immediately, then every 10 seconds.
	readonly status = toSignal(
		this.#http.get<Status>('/api/status').pipe(poll(10_000)),
	);
}
```

`toSignal` unsubscribes when the component is destroyed, which stops the polling.

## Start after a delay

Pass a second argument to wait before the first call:

```ts
this.#http.get<Status>('/api/status').pipe(poll(10_000, 5_000)); // first call after 5s
```

## Behavior

- Each tick subscribes to the source again, so every poll is a fresh HTTP request.
- Polls never overlap. If a request takes longer than the period, the ticks that arrive meanwhile are queued and run one after another once it completes.
- The source must complete. A source that never completes is only subscribed once.
- An error from the source ends the polling. To keep going, handle the error on the source with `catchError` before `poll`.

## Pause while the tab is hidden

Combine `poll` with [`whenDocumentVisible`](/utilities/rxjs-operators/when-document-visible/) to stop polling when the user switches tabs:

```ts
this.#http.get<Status>('/api/status').pipe(poll(10_000), whenDocumentVisible());
```

## API

```ts
function poll<T>(
	period: number,
	initialDelay?: number,
): MonoTypeOperatorFunction<T>;
```

| Argument       | Type     | Default | Description                                 |
| -------------- | -------- | ------- | ------------------------------------------- |
| `period`       | `number` | –       | Milliseconds between two polls.             |
| `initialDelay` | `number` | `0`     | Milliseconds to wait before the first poll. |
