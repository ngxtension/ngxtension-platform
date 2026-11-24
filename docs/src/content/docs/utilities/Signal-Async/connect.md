---
title: connect
description: Keeps a writable signal updated from an observable or another signal, with automatic cleanup.
entryPoint: ngxtension/connect
badge: stable
contributors: ['enea-jahollari', 'josh-morony', 'chau-tran']
---

`connect` pushes every value from an observable (or another signal) into a writable signal you own. The signal stays writable, so you can still `set` it yourself, and the subscription is closed automatically when the component or service is destroyed. For object state, partial values are merged in, so you can feed different streams into different parts of one state signal.

## Usage

```angular-ts
import { Component, inject, Injectable, signal } from '@angular/core';
import { connect } from 'ngxtension/connect';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PagingService {
	readonly pageNumber$ = new BehaviorSubject(1);
}

@Component({
	selector: 'app-pager',
	template: `
		<p>Page {{ pageNumber() }}</p>
		<button (click)="pageNumber.set(1)">First page</button>
	`,
})
export class Pager {
	private readonly paging = inject(PagingService);

	readonly pageNumber = signal(1);

	constructor() {
		connect(this.pageNumber, this.paging.pageNumber$);
	}
}
```

Each emission of `pageNumber$` is written into `pageNumber`. `connect` returns the `Subscription` in case you want to stop it early.

## Merge partial updates into object state

When the signal holds an object, each emission is shallow-merged into the current value. A stream only needs to emit the properties it changes:

```ts
readonly state = signal({ user: { firstName: 'Chau', lastName: 'Tran' }, loading: false });

readonly loading$ = new Subject<boolean>();

constructor() {
	// emits { loading: true }, keeps `user` as it is
	connect(this.state, this.loading$.pipe(map((loading) => ({ loading }))));
}
```

Arrays and primitives are replaced, not merged.

## Use a reducer

Pass a reducer as the third argument to compute the update from the previous value and the emitted value. The result is merged the same way:

```ts
readonly lastName$ = new Subject<string>();

constructor() {
	connect(this.state, this.lastName$, (prev, lastName) => ({
		user: { ...prev.user, lastName },
	}));
}
```

Selectors that read other parts of the state (`computed(() => this.state().user.firstName)`) keep their value, so effects that depend only on them don't re-run.

## Connect to another signal

Pass a function that reads signals instead of an observable. `connect` creates an `effect` that writes the result into your signal whenever those signals change, and returns the `EffectRef`:

```ts
private readonly userService = inject(UserService);

readonly name = signal('');

constructor() {
	connect(this.name, () => this.userService.user().name);
}
```

This keeps `name` writable (for example for a form field) while it follows the source signal. Angular's [`linkedSignal`](https://angular.dev/guide/signals/linked-signal) solves the same problem without an effect; prefer it in new code.

## Connect several streams to one signal

Call `connect` with only the signal to get a `ConnectedSignal`, then chain `.with()` for each stream. Each `.with()` takes the same arguments as `connect` (a stream, a stream plus reducer, or a signal function):

```ts
const connected = connect(this.state)
	.with(this.loading$.pipe(map((loading) => ({ loading }))))
	.with(this.lastName$, (prev, lastName) => ({
		user: { ...prev.user, lastName },
	}))
	.with(this.firstName$, (prev, firstName) => ({
		user: { ...prev.user, firstName },
	}));

// You can add more streams later
connected.with(this.stop$.pipe(map(() => ({ loading: false }))));

// Stop all observable connections at once
connected.subscription.unsubscribe();
```

After `subscription` is closed, further `.with()` calls are ignored.

## Outside an injection context

In an injection context, `connect` uses the current `DestroyRef`. Elsewhere (for example in `ngOnInit`), pass an `Injector` or a `DestroyRef` as the last argument:

```ts
private readonly destroyRef = inject(DestroyRef);

ngOnInit() {
	connect(this.pageNumber, this.paging.pageNumber$, this.destroyRef);
}
```

## API

```ts
// observable → signal
function connect<T>(
	signal: WritableSignal<T>,
	observable: Observable<PartialOrValue<T>>,
	injectorOrDestroyRef?: Injector | DestroyRef,
	useUntracked?: boolean,
): Subscription;

// observable + reducer → signal
function connect<T, V>(
	signal: WritableSignal<T>,
	observable: Observable<V>,
	reducer: (previous: T, next: V) => PartialOrValue<T>,
	injectorOrDestroyRef?: Injector | DestroyRef,
	useUntracked?: boolean,
): Subscription;

// signal → signal
function connect<T>(
	signal: WritableSignal<T>,
	originSignal: () => T,
): EffectRef;

// several sources
function connect<T>(
	signal: WritableSignal<T>,
	injectorOrDestroyRef?: Injector | DestroyRef,
	useUntracked?: boolean,
): ConnectedSignal<T>; // { with(...): ConnectedSignal<T>; subscription: Subscription }
```

`PartialOrValue<T>` is `Partial<T>` when `T` is an object, otherwise `T`.

| Argument               | Description                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------ |
| `signal`               | The writable signal to update.                                                       |
| `observable`           | Source stream. Object emissions are shallow-merged into object state.                |
| `reducer`              | Optional. `(previous, next) => update`. Its result is merged like a plain emission.  |
| `originSignal`         | A function that reads signals. Tracked in an `effect`.                               |
| `injectorOrDestroyRef` | Optional. Needed outside an injection context. Ends the subscription when destroyed. |
| `useUntracked`         | Optional, default `false`. Writes to the signal inside `untracked()`.                |
