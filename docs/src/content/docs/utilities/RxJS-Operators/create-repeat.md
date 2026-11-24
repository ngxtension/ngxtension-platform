---
title: createRepeat
description: Create an RxJS repeat operator that re-runs a source Observable each time you call emit(), for example from a refresh button.
entryPoint: ngxtension/create-repeat
badge: stable
contributors: ['lucas-garcia']
---

`createRepeat` gives you an RxJS `repeat` operator with an `emit()` method attached. Pipe a source through it, and every call to `emit()` subscribes to that source again. It's a tidy way to wire a "Refresh" or "Retry" button to an HTTP request without managing a `Subject` yourself.

## Usage

```angular-ts
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { createRepeat } from 'ngxtension/create-repeat';

interface Quote {
	text: string;
	author: string;
}

@Component({
	selector: 'app-quote',
	template: `
		<blockquote>{{ quote()?.text }}</blockquote>
		<button (click)="refresh.emit()">Another quote</button>
	`,
})
export class QuoteComponent {
	readonly #http = inject(HttpClient);

	readonly refresh = createRepeat();

	// Fetches once on load, then again on every click.
	readonly quote = toSignal(
		this.#http.get<Quote>('/api/quote').pipe(this.refresh()),
	);
}
```

The source runs once when it's subscribed. After it completes, the next `refresh.emit()` subscribes to it again.

:::caution
The operator only listens for `emit()` after the source completes. Calls made while a request is still in flight are ignored, and a source that never completes is never repeated.
:::

It's shorthand for this:

```ts
readonly refresh$ = new Subject<void>();

readonly quote = toSignal(
	this.#http
		.get<Quote>('/api/quote')
		.pipe(repeat({ delay: () => this.refresh$ })),
);
```

## Limit the number of runs

Pass a count to cap how many times the source runs in total, including the first run. You can set it once for every operator created from the same `createRepeat`, or per pipe.

```ts
// Every pipe using this operator runs at most 3 times.
readonly refresh = createRepeat(3);

// This pipe runs at most 5 times, whatever the global count says.
readonly quote = toSignal(
	this.#http.get<Quote>('/api/quote').pipe(this.refresh(5)),
);
```

A count of `0` gives you an empty Observable. Once the count is reached, the stream completes and further `emit()` calls do nothing for it.

## Outside an injection context

`createRepeat` injects `DestroyRef` to complete its internal notifier when the component or service is destroyed. When you call it outside an injection context, pass a `DestroyRef` yourself:

```ts
const refresh = createRepeat(destroyRef);
// or, with a count
const refresh = createRepeat(3, destroyRef);
```

## API

```ts
function createRepeat(destroyRef?: DestroyRef): CreateRepeat;
function createRepeat(
	globalCount?: number,
	destroyRef?: DestroyRef,
): CreateRepeat;

type CreateRepeat = (<T>(count?: number) => MonoTypeOperatorFunction<T>) & {
	emit: () => void;
};
```

| Argument      | Type         | Default                | Description                                                                      |
| ------------- | ------------ | ---------------------- | -------------------------------------------------------------------------------- |
| `globalCount` | `number`     | `undefined` (no limit) | Maximum number of runs for every operator created from this instance.            |
| `destroyRef`  | `DestroyRef` | `inject(DestroyRef)`   | Completes the repeat notifier on destroy. Required outside an injection context. |

The returned operator takes an optional `count: number` that overrides `globalCount` for that pipe.

:::note
When the `DestroyRef` is destroyed, the internal notifier completes, so any stream waiting for the next `emit()` completes too.
:::

## Related

- [`rxEffect`](/utilities/effects-side-effects/rx-effect/) to subscribe to the repeated stream with automatic cleanup.
- RxJS [`repeat`](https://rxjs.dev/api/index/function/repeat), which this operator wraps.
