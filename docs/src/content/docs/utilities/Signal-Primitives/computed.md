---
title: extendedComputed
description: A computed signal whose callback receives its own previously computed value.
entryPoint: ngxtension/extended-computed
badge: deprecated
contributors: ['chau-tran']
---

:::caution[Deprecated]
`extendedComputed` is deprecated in favour of Angular's [`linkedSignal`](https://angular.dev/guide/signals/linked-signal), which also gives you the previous value in its `computation` function. See [Migrate to `linkedSignal`](#migrate-to-linkedsignal) below.
:::

`extendedComputed` works like Angular's `computed`, but its callback receives the value it computed last time. This lets you keep the old result when a condition doesn't pass, instead of returning a placeholder.

## Usage

```ts
import { signal } from '@angular/core';
import { extendedComputed } from 'ngxtension/extended-computed';

const multiplier = signal(2);
const count = signal(1);

const result = extendedComputed<number>((previousValue) => {
	// only compute when multiplier is even
	if (multiplier() % 2 === 0) {
		return count() * multiplier();
	}
	return previousValue;
});

result(); // 2

multiplier.set(3); // odd number
result(); // 2, the previous value

multiplier.set(4);
result(); // 4
```

On the first run `previousValue` is `undefined`.

## Migrate to `linkedSignal`

`linkedSignal` passes the previous source and value to its `computation`. The example above becomes:

```ts
import { linkedSignal, signal } from '@angular/core';

const multiplier = signal(2);
const count = signal(1);

const result = linkedSignal<{ multiplier: number; count: number }, number>({
	source: () => ({ multiplier: multiplier(), count: count() }),
	computation: (source, previous) => {
		if (source.multiplier % 2 === 0) {
			return source.count * source.multiplier;
		}
		return previous?.value ?? 0;
	},
});
```

`linkedSignal` returns a `WritableSignal`, so you can also `set` it by hand.

## API

```ts
function extendedComputed<TValue>(
	computedCallback: (currentValue: TValue) => TValue,
	options?: CreateComputedOptions<TValue>,
): Signal<TValue>;
```

| Parameter          | Type                               | Description                                                                              |
| ------------------ | ---------------------------------- | ---------------------------------------------------------------------------------------- |
| `computedCallback` | `(currentValue: TValue) => TValue` | Receives the last computed value (`undefined` on the first run) and returns the new one. |
| `options`          | `CreateComputedOptions<TValue>`    | Optional. Passed to `computed`. Defaults to `{ equal: Object.is }`.                      |
