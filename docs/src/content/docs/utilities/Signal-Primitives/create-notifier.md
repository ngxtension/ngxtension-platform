---
title: createNotifier
description: Creates a signal you can trigger by hand to re-run effects and computeds, like a refresh button for reactive code.
entryPoint: ngxtension/create-notifier
badge: experimental
contributors: ['josh-morony', 'endlacer']
---

`createNotifier` gives you a signal with no meaningful value that you trigger by hand. Read it in an `effect` or `computed` to make that code re-run whenever you call `notify()`. It is useful when there is no natural signal to depend on, for example a "refresh" button, a mutated `Map`, or a lifecycle event.

## Usage

```angular-ts
import { Component, effect } from '@angular/core';
import { createNotifier } from 'ngxtension/create-notifier';

@Component({
	selector: 'app-dashboard',
	template: `<button (click)="refresh.notify()">Refresh</button>`,
})
export class Dashboard {
	readonly refresh = createNotifier();

	constructor() {
		effect(() => {
			this.refresh.listen(); // track the notifier
			this.loadData();
		});
	}

	loadData() {
		// runs once on init and again every time refresh.notify() is called
	}
}
```

`listen` is a read-only signal holding a counter. It starts at `0` and goes up by one on every `notify()`.

### Skip the initial run

An `effect` always runs once when it is created. Because the counter starts at `0`, you can skip that first run with a truthy check:

```ts
effect(() => {
	if (this.refresh.listen()) {
		// runs only after notify() has been called
	}
});
```

### Use it in a computed

Anything that reads `listen()` re-evaluates on `notify()`. This lets a `computed` pick up changes to a plain mutable object:

```ts
readonly cache = new Map<string, number>();
readonly cacheChanged = createNotifier();

readonly total = computed(() => {
	this.cacheChanged.listen();
	return [...this.cache.values()].reduce((sum, n) => sum + n, 0);
});

add(key: string, value: number) {
	this.cache.set(key, value);
	this.cacheChanged.notify();
}
```

:::tip
For reactive `Map` and `Set` collections, use [`SignalMap`](/utilities/signal-primitives/signal-map/) and [`SignalSet`](/utilities/signal-primitives/signal-set/) instead. They are built on `createNotifier`.
:::

## Notify when other signals change

Pass `deps` to also increment the counter whenever any of those signals change. This combines manual refreshes with automatic dependency tracking.

```ts
readonly userId = signal(1);
readonly tenantId = signal('tenant-a');

readonly reload = createNotifier({ deps: [this.userId, this.tenantId] });

constructor() {
	effect(() => {
		this.reload.listen();
		// runs when userId or tenantId changes, or when reload.notify() is called
	});
}
```

With `deps`, the counter starts at `1`, so the truthy check above does **not** skip the first run. Set `depsEmitInitially: false` to start at `0` instead:

```ts
readonly reload = createNotifier({
	deps: [this.userId],
	depsEmitInitially: false, // starts at 0, like a notifier without deps
});
```

## API

```ts
function createNotifier(options?: {
	deps?: Signal<any>[];
	depsEmitInitially?: boolean;
}): {
	notify: () => void;
	listen: Signal<number>;
};
```

| Option              | Type            | Default | Description                                                                                  |
| ------------------- | --------------- | ------- | -------------------------------------------------------------------------------------------- |
| `deps`              | `Signal<any>[]` | `[]`    | Signals that also increment the counter when they change.                                    |
| `depsEmitInitially` | `boolean`       | `true`  | Only used with `deps`. When `true` the counter starts at `1`; when `false` it starts at `0`. |

| Returned | Type             | Description                                                       |
| -------- | ---------------- | ----------------------------------------------------------------- |
| `notify` | `() => void`     | Increments the counter, notifying everything that reads `listen`. |
| `listen` | `Signal<number>` | Read-only counter signal. Read it to subscribe to notifications.  |

`createNotifier` doesn't need an injection context, so you can call it anywhere.
