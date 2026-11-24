---
title: derivedFrom
description: Combines signals and observables into one signal, with optional RxJS operators in between (like combineLatest for signals).
entryPoint: ngxtension/derived-from
badge: stable
contributors: ['enea-jahollari']
---

`derivedFrom` combines several signals and observables into a single signal, like RxJS `combineLatest`. Because the combined value goes through an RxJS pipeline, you can add operators such as `debounceTime` or `switchMap` before the result lands back in a signal, which `computed` can't do.

:::tip[Background]
Read the story behind it: [A sweet spot between signals and observables](https://itnext.io/a-sweet-spot-between-signals-and-observables-a3c9620768f1).
:::

## Usage

```angular-ts
import { Component, inject, Injectable, signal } from '@angular/core';
import { derivedFrom } from 'ngxtension/derived-from';
import { BehaviorSubject, debounceTime, map, Observable, of, pipe, switchMap } from 'rxjs';

interface Filters {
	name: string;
}

@Injectable({ providedIn: 'root' })
export class PeopleService {
	readonly filters$ = new BehaviorSubject<Filters>({ name: '' });

	search(page: number, filters: Filters): Observable<string[]> {
		return of([`${filters.name} (page ${page})`]);
	}
}

@Component({
	selector: 'app-people',
	template: `
		@for (person of people(); track person) {
			<p>{{ person }}</p>
		}
		<button (click)="page.set(page() + 1)">Next page</button>
	`,
})
export class People {
	private readonly peopleService = inject(PeopleService);

	readonly page = signal(1);

	readonly people = derivedFrom(
		[this.page, this.peopleService.filters$],
		pipe(
			debounceTime(300),
			switchMap(([page, filters]) => this.peopleService.search(page, filters)),
		),
		{ initialValue: [] },
	);
}
```

`people` updates whenever `page` or `filters$` changes, after a 300 ms debounce. `initialValue` is required here because the pipeline doesn't emit synchronously (see [The first value](#the-first-value)).

## Combine values

Pass an array to get a tuple, or an object to get an object with the same keys:

```ts
const page = signal(1);
const filters$ = new BehaviorSubject({ name: 'John' });

const asArray = derivedFrom([page, filters$]);
asArray(); // [1, { name: 'John' }]

const asObject = derivedFrom({ page, filters: filters$ });
asObject(); // { page: 1, filters: { name: 'John' } }
```

Sources can be signals, observables, functions that read signals (`() => page() * 10`), or any other RxJS `ObservableInput` such as a Promise. Consecutive duplicate values from observable sources are skipped.

Without an operator, combining only signals gives the same result as `computed`. The benefit comes when you mix in observables, or when you add operators.

## Transform with RxJS operators

The second argument is an RxJS operator. Use `pipe()` to chain several:

```ts
readonly result = derivedFrom(
	[this.a, this.b],
	pipe(
		switchMap(([a, b]) => this.api.sum(a, b)), // async, e.g. an HTTP request
		map((sum) => sum * 2),
	),
	{ initialValue: 0 },
);
```

## The first value

A signal must always have a value, so `derivedFrom` needs one right away. Signal sources and `BehaviorSubject`s provide one synchronously. A plain `Subject`, an HTTP request or an async operator (`delay`, `debounceTime`, `switchMap` to a request) don't, and then `derivedFrom` **throws**:

```ts
const page$ = new Subject<number>(); // no current value
const combined = derivedFrom([page$, filters$]); // throws
```

There are two fixes.

**Pass `initialValue`** in the options. The signal holds it until the pipeline emits:

```ts
const c = derivedFrom(
	[a, b],
	pipe(switchMap(([a, b]) => of(a + b).pipe(delay(1000)))),
	{ initialValue: 42 },
);
// 42 right away, then a + b about 1 second later
```

**Or add `startWith`** to the pipeline (or to a single source), so it emits synchronously:

```ts
const c = derivedFrom(
	[a, b],
	pipe(
		switchMap(([a, b]) => of(a + b).pipe(delay(1000))),
		startWith(0),
	),
);

const combined = derivedFrom([page$.pipe(startWith(1)), filters$]);
```

When you pass only `initialValue` and no operator, use the two-argument form: `derivedFrom(sources, { initialValue })`.

## Outside an injection context

`derivedFrom` uses `toSignal` and `toObservable`, so it needs an injection context. Elsewhere, pass an `injector`:

```ts
private readonly injector = inject(Injector);
readonly page = signal(1);
data!: Signal<string[]>;

ngOnInit() {
	this.data = derivedFrom(
		[this.page, this.peopleService.filters$],
		switchMap(([page, filters]) => this.peopleService.search(page, filters)),
		{ initialValue: [], injector: this.injector },
	);
}
```

## API

```ts
// array of sources → tuple
function derivedFrom<Input extends readonly unknown[], Output = Input>(
	sources: readonly [...Sources<Input>],
	operator?: OperatorFunction<Input, Output>,
	options?: DerivedFromOptions<Output>,
): Signal<Output>;

// object of sources → object
function derivedFrom<Input extends object, Output = Input>(
	sources: Sources<Input>,
	operator?: OperatorFunction<Input, Output>,
	options?: DerivedFromOptions<Output>,
): Signal<Output>;

// both also accept (sources, options) without an operator
```

Each source is a `Signal<T>`, an `ObservableInput<T>` or a `() => T` function.

| Option         | Type       | Default         | Description                                                                                                    |
| -------------- | ---------- | --------------- | -------------------------------------------------------------------------------------------------------------- |
| `initialValue` | `Output`   | none            | Value until the pipeline first emits. Without it, the first value must be synchronous or `derivedFrom` throws. |
| `injector`     | `Injector` | current context | Needed outside an injection context.                                                                           |

:::note[Timing]
Signal sources are read through `toObservable`, so a signal change reaches the pipeline when Angular runs effects, not synchronously at `set()` time. Subscriptions end when the injector (usually the component) is destroyed.
:::

## Related

- [`mergeFrom`](/utilities/signal-async/merge-from/) emits the latest value of any source instead of combining them.
- For loading data from signals, Angular's [`rxResource`](https://angular.dev/api/core/rxjs-interop/rxResource) also gives you loading and error state.
