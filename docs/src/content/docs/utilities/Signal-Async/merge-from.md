---
title: mergeFrom
description: Merges signals and observables into one signal that holds whichever value arrived last (like RxJS merge for signals).
entryPoint: ngxtension/merge-from
badge: stable
contributors: ['chau-tran']
---

`mergeFrom` merges several signals and observables into a single signal, like RxJS `merge`. The signal holds the most recent value from any source. Use it when several sources produce the same kind of value, for example a selection that can come from a click, a route parameter or a keyboard shortcut. You can add RxJS operators before the value lands in the signal.

It differs from [`derivedFrom`](/utilities/signal-async/derived-from/), which combines the latest value of **every** source into a tuple or object.

## Usage

```angular-ts
import { Component, signal } from '@angular/core';
import { mergeFrom } from 'ngxtension/merge-from';
import { Subject } from 'rxjs';

@Component({
	selector: 'app-status',
	template: `
		<p>Last event: {{ lastEvent() }}</p>
		<button (click)="clicked.set('clicked')">Click</button>
		<button (click)="keyPressed$.next('key pressed')">Press</button>
	`,
})
export class Status {
	readonly clicked = signal('idle');
	readonly keyPressed$ = new Subject<string>();

	readonly lastEvent = mergeFrom([this.clicked, this.keyPressed$]);
}
```

`lastEvent` starts as `'idle'` (the signal's current value) and then holds whichever source emitted last.

## Which value comes first

On creation, every source that has a value emits it synchronously, in array order. The signal ends up with the **last** of those values:

```ts
const runnerOne = signal({ name: 'Naruto' });
const runnerTwo$ = new BehaviorSubject({ name: 'Goku' });

const lastRunner = mergeFrom([runnerOne, runnerTwo$]);
lastRunner(); // { name: 'Goku' }
```

Sources can be signals, observables or any other RxJS `ObservableInput`. Consecutive duplicate values from observable sources are skipped.

## Transform with RxJS operators

The second argument is an RxJS operator. Use `pipe()` to chain several:

```ts
readonly announcement = mergeFrom(
	[this.runnerOne, this.runnerTwo],
	pipe(
		switchMap((runner) => of(`The last runner to arrive was ${runner.name}`).pipe(delay(1000))),
	),
	{ initialValue: 'Waiting for someone to arrive...' },
);
```

## The first value

A signal must always have a value. If no source emits synchronously (only plain `Subject`s, HTTP requests, or an async operator such as `delay` in the pipeline), `mergeFrom` **throws**:

```ts
const runnerOne$ = new Subject<string>();
const runnerTwo$ = new Subject<string>();

const lastRunner = mergeFrom([runnerOne$, runnerTwo$]); // throws
```

Fix it in one of two ways.

**Pass `initialValue`**. Without an operator, pass the options as the second argument:

```ts
const lastRunner = mergeFrom([runnerOne$, runnerTwo$], {
	initialValue: 'nobody yet',
});
```

**Or add `startWith`** to a source or to the pipeline:

```ts
const lastRunner = mergeFrom([
	runnerOne$.pipe(startWith('nobody yet')),
	runnerTwo$,
]);
```

## Outside an injection context

`mergeFrom` uses `toSignal` and `toObservable`, so it needs an injection context. Elsewhere, pass an `injector`:

```ts
private readonly injector = inject(Injector);

ngOnInit() {
	const lastRunner = mergeFrom([this.runnerOne$, this.runnerTwo$], {
		initialValue: 'nobody yet',
		injector: this.injector,
	});
}
```

## API

```ts
function mergeFrom<Inputs extends readonly unknown[], Output = Inputs[number]>(
	inputs: readonly [
		...{ [K in keyof Inputs]: Signal<Inputs[K]> | ObservableInput<Inputs[K]> },
	],
	operator?: OperatorFunction<Inputs[number], Output>,
	options?: MergeFromOptions<Output>,
): Signal<Output>;

function mergeFrom<Inputs extends readonly unknown[], Output = Inputs[number]>(
	inputs: readonly [
		...{ [K in keyof Inputs]: Signal<Inputs[K]> | ObservableInput<Inputs[K]> },
	],
	options?: MergeFromOptions<Output>,
): Signal<Output>;
```

| Option         | Type       | Default         | Description                                                                                           |
| -------------- | ---------- | --------------- | ----------------------------------------------------------------------------------------------------- |
| `initialValue` | `Output`   | none            | Value until a source first emits. Without it, a source must emit synchronously or `mergeFrom` throws. |
| `injector`     | `Injector` | current context | Needed outside an injection context.                                                                  |

:::note[Timing]
Signal sources are read through `toObservable`, so a signal change reaches the pipeline when Angular runs effects, not synchronously at `set()` time. Subscriptions end when the injector (usually the component) is destroyed.
:::

## Related

- [`derivedFrom`](/utilities/signal-async/derived-from/) combines the latest value of all sources.
