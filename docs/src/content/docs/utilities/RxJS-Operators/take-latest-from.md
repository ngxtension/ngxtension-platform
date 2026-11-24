---
title: takeLatestFrom
description: An RxJS operator like withLatestFrom that waits for the other Observables to emit instead of dropping the source value.
entryPoint: ngxtension/take-latest-from
badge: stable
contributors: ['evgeniy-oz']
---

`takeLatestFrom` pairs each source value with the latest values of other Observables, like `withLatestFrom`. The difference: if one of them hasn't emitted yet, `takeLatestFrom` waits for it instead of silently dropping the source value. Use it when every source value must be handled, such as a button click that needs the current user.

```txt
withLatestFrom:   click ──▶ (user$ not loaded yet: click is lost)
takeLatestFrom:   click ──▶ waits ── user$ emits ──▶ [click, user]
```

## Usage

```angular-ts
import { Component, inject } from '@angular/core';
import { concatMap, Subject } from 'rxjs';
import { rxEffect } from 'ngxtension/rx-effect';
import { takeLatestFrom } from 'ngxtension/take-latest-from';

@Component({
	selector: 'app-draft-editor',
	template: `
		<textarea #text></textarea>
		<button (click)="save$.next(text.value)">Save</button>
	`,
})
export class DraftEditorComponent {
	// Your app's services: `currentUser$` emits once the user has loaded.
	readonly #session = inject(SessionStore);
	readonly #drafts = inject(DraftsApi);

	readonly save$ = new Subject<string>();

	constructor() {
		rxEffect(
			this.save$.pipe(
				takeLatestFrom(() => this.#session.currentUser$),
				concatMap(([text, user]) => this.#drafts.save(user.id, text)),
			),
		);
	}
}
```

Every click is saved, even one that happens before `currentUser$` has loaded.

## Several Observables

Return an array from the factory to combine more than one. The result is a tuple of the source value followed by one value per Observable:

```ts
this.save$.pipe(
	takeLatestFrom(() => [this.#session.currentUser$, this.#session.settings$]),
	concatMap(([text, user, settings]) => /* … */),
);
```

The factory receives the source value, so you can pick Observables based on it:

```ts
this.productId$.pipe(takeLatestFrom((id) => this.#inventory.stock$(id)));
```

## How it differs from withLatestFrom

`withLatestFrom(data$)` drops every source value that arrives before `data$` has emitted at least once. `takeLatestFrom` holds that source value and emits as soon as `data$` emits.

For every source value, `takeLatestFrom` subscribes to the Observables the factory returns, takes their first combined value and unsubscribes. So the Observables should replay their latest value to new subscribers, like a `BehaviorSubject`, `shareReplay(1)`, `toObservable(signal)` or a store selector. A plain `Subject` makes it wait for the next emission, and a cold HTTP call fires a new request per source value.

Source values are handled one at a time (`concatMap`): while one waits, the next ones queue up behind it.

## API

```ts
function takeLatestFrom<T extends Observable<unknown>[], V>(
	observablesFactory: (value: V) => [...T],
): OperatorFunction<V, [V, ...{ [i in keyof T]: ObservedValueOf<T[i]> }]>;

function takeLatestFrom<T extends Observable<unknown>, V>(
	observableFactory: (value: V) => T,
): OperatorFunction<V, [V, ObservedValueOf<T>]>;
```

| Argument             | Type                                       | Description                                              |
| -------------------- | ------------------------------------------ | -------------------------------------------------------- |
| `observablesFactory` | `(value: V) => Observable \| Observable[]` | Returns the Observable(s) to take the latest value from. |
