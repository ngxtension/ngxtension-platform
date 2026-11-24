---
title: SignalSet
description: A reactive Set that notifies computeds, effects and templates when values are added or removed.
entryPoint: ngxtension/collections
badge: stable
contributors: ['enea-jahollari']
---

`SignalSet` is a `Set` that works with Angular signals. Reading it inside a `computed`, `effect` or template tracks the set, and adding or removing a value notifies those readers. Adding a value that is already in the set does nothing, so it doesn't trigger updates either.

## Usage

```angular-ts
import { Component, computed } from '@angular/core';
import { SignalSet } from 'ngxtension/collections';

@Component({
	selector: 'app-tags',
	template: `
		<p>{{ count() }} tags, angular selected: {{ hasAngular() }}</p>

		@for (tag of sortedTags(); track tag) {
			<button (click)="tags.delete(tag)">{{ tag }} x</button>
		}

		<button (click)="tags.add('angular')">Add angular</button>
	`,
})
export class Tags {
	readonly tags = new SignalSet<string>(['typescript', 'rxjs']);

	readonly count = computed(() => this.tags.size);
	readonly hasAngular = computed(() => this.tags.has('angular'));
	readonly sortedTags = computed(() => [...this.tags].sort());
}
```

You use the normal `Set` methods (`add`, `has`, `delete`, `clear`, `size`, `keys`, `values`, `entries`, `forEach`, `for...of`).

## Reactivity

Every read (`has`, `size`, iteration) tracks the set's membership. Readers re-run when:

- a new value is added,
- a value is deleted,
- the set is cleared (only if it wasn't already empty).

Adding a duplicate doesn't notify anyone:

```ts
const flags = new SignalSet<string>();
const count = computed(() => flags.size);

flags.add('dark-mode'); // count re-runs
flags.add('dark-mode'); // already there: nothing re-runs
flags.delete('dark-mode'); // count re-runs
```

:::note
Unlike [`SignalMap`](/utilities/signal-primitives/signal-map/), there is no per-value tracking: `has('a')` re-runs when any value is added or removed, not only `'a'`.
:::

## Value equality

Values are compared like a native `Set` (SameValueZero). `undefined`, `null`, `0`, `''`, `NaN` and symbols all work as values. Objects are compared by identity:

```ts
const alice = { id: 1, name: 'Alice' };
const users = new SignalSet([alice]);

users.has(alice); // true
users.has({ id: 1, name: 'Alice' }); // false, a different object
```

## Example: selection state

```ts
import { computed } from '@angular/core';
import { SignalSet } from 'ngxtension/collections';

export class Selection<T> {
	private readonly selected = new SignalSet<T>();

	readonly items = computed(() => [...this.selected]);
	readonly count = computed(() => this.selected.size);
	readonly hasSelection = computed(() => this.selected.size > 0);

	isSelected(item: T) {
		return this.selected.has(item);
	}

	toggle(item: T) {
		if (this.selected.has(item)) {
			this.selected.delete(item);
		} else {
			this.selected.add(item);
		}
	}

	clear() {
		this.selected.clear();
	}
}
```

Call `isSelected(item)` from a template or a `computed` and it stays reactive.

## Set operations

Combine sets inside a `computed` to get reactive unions, intersections and differences:

```ts
const a = new SignalSet([1, 2, 3]);
const b = new SignalSet([2, 3, 4]);

const union = computed(() => new Set([...a, ...b])); // {1, 2, 3, 4}
const intersection = computed(() => [...a].filter((v) => b.has(v))); // [2, 3]
const difference = computed(() => [...a].filter((v) => !b.has(v))); // [1]
```

## API

```ts
class SignalSet<T> implements Set<T> {
	constructor(values?: readonly T[] | null);

	add(value: T): this;
	has(value: T): boolean;
	delete(value: T): boolean;
	clear(): void;
	get size(): number;

	keys(): IterableIterator<T>; // same as values()
	values(): IterableIterator<T>;
	entries(): IterableIterator<[T, T]>;
	forEach(
		callback: (value: T, value2: T, set: Set<T>) => void,
		thisArg?: any,
	): void;
	[Symbol.iterator](): IterableIterator<T>;
}
```

The methods behave like their native `Set` counterparts and iterate in insertion order. `SignalSet` implements the `Set<T>` interface, so you can usually pass it where a `Set<T>` is expected (the newer set-composition methods such as `union()` are not implemented). Convert it with `new Set(signalSet)` when you need a plain, non-reactive copy.

`SignalSet` doesn't need an injection context; you can create it anywhere.

## Related

- [`SignalMap`](/utilities/signal-primitives/signal-map/) is the reactive `Map` counterpart, with per-key tracking.
- [`createNotifier`](/utilities/signal-primitives/create-notifier/) for making other mutable structures reactive.
