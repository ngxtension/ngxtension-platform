---
title: toObservableSignal
description: Turns a signal into a value that is both a signal and an RxJS observable, so you can call it and pipe it.
entryPoint: ngxtension/to-observable-signal
badge: stable
contributors: ['evgeniy-oz']
---

`toObservableSignal` wraps a signal so the same value is both a signal and an RxJS `Observable`. You can read it with `a()`, write it with `a.set()` if it is writable, and also `pipe()` or `subscribe()` to it. This saves you from keeping a signal and a `toObservable()` copy side by side.

## Usage

```angular-ts
import { AsyncPipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { toObservableSignal } from 'ngxtension/to-observable-signal';
import { map } from 'rxjs';

@Component({
	selector: 'app-counter',
	imports: [AsyncPipe],
	template: `
		<p>Signal: {{ count() }}</p>
		<p>Observable: {{ count | async }}</p>
		<p>Doubled (RxJS): {{ doubled$ | async }}</p>
		<p>Tripled (computed): {{ tripled() }}</p>
		<button (click)="increment()">+1</button>
	`,
})
export class Counter {
	readonly count = toObservableSignal(signal(0));

	readonly doubled$ = this.count.pipe(map((v) => v * 2));
	readonly tripled = computed(() => this.count() * 3);

	increment() {
		this.count.update((v) => v + 1);
	}
}
```

Passing a `WritableSignal` gives you back something that is still writable (`set`, `update`, `asReadonly`). Passing a read-only `Signal` gives you a read-only `Signal` that is also an `Observable`.

## From an observable

You can also pass an `Observable`. It is converted with `toSignal`, so you get a signal you can call plus the original observable:

```ts
readonly ticks = toObservableSignal<number>(interval(1000));

// ticks() reads the latest value, ticks.pipe(...) works on the original stream
```

:::caution

- Pass the type argument (`<number>`) yourself. TypeScript doesn't infer it from an observable and falls back to `unknown`.
- The signal side reads `undefined` until the observable first emits, but the return type is `Signal<T>`, not `Signal<T | undefined>`. Use an observable that emits synchronously (a `BehaviorSubject`, or add `startWith`) to avoid surprises.
  :::

## Injection context

The observable side uses Angular's `toObservable()` (and `toSignal()` for observable input), so call `toObservableSignal` in an injection context, or pass an `injector` in the options:

```ts
private readonly injector = inject(Injector);

ngOnInit() {
	const count = toObservableSignal(signal(0), { injector: this.injector });
}
```

As with `toObservable()`, the observable emits asynchronously, when Angular runs effects, not synchronously on every `set()`.

## API

```ts
function toObservableSignal<T>(
	source: WritableSignal<T> | Subscribable<T>,
	options?: ToObservableOptions,
): WritableSignal<T> & Observable<T>;

function toObservableSignal<T>(
	source: Signal<T> | Subscribable<T>,
	options?: ToObservableOptions,
): Signal<T> & Observable<T>;
```

| Option     | Type       | Default         | Description                                           |
| ---------- | ---------- | --------------- | ----------------------------------------------------- |
| `injector` | `Injector` | current context | Needed when you call it outside an injection context. |

## Related

- Angular's [`toObservable`](https://angular.dev/api/core/rxjs-interop/toObservable) and [`toSignal`](https://angular.dev/api/core/rxjs-interop/toSignal).
- [`toLazySignal`](/utilities/signal-primitives/to-lazy-signal/) subscribes only when the signal is first read.
