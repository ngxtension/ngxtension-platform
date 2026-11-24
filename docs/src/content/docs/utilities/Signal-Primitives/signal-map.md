---
title: SignalMap
description: A reactive Map with per-key reactivity, so computeds and effects only re-run when the keys they read change.
entryPoint: ngxtension/collections
badge: stable
contributors: ['enea-jahollari']
---

`SignalMap` is a `Map` that works with Angular signals. Reading it inside a `computed`, `effect` or template tracks what you read, and writing to it notifies only the readers that care. Each key has its own signal, so updating one key doesn't re-run code that reads a different key.

## Usage

```angular-ts
import { Component, computed } from '@angular/core';
import { SignalMap } from 'ngxtension/collections';

interface User {
	name: string;
	role: 'admin' | 'user';
}

@Component({
	selector: 'app-users',
	template: `
		<p>Total users: {{ totalUsers() }}</p>
		<p>Admin: {{ adminName() }}</p>

		@for (entry of entries(); track entry[0]) {
			<p>{{ entry[0] }}: {{ entry[1].name }}</p>
		}

		<button (click)="addUser()">Add user</button>
	`,
})
export class Users {
	readonly users = new SignalMap<number, User>([
		[1, { name: 'Alice', role: 'admin' }],
		[2, { name: 'Bob', role: 'user' }],
	]);

	readonly totalUsers = computed(() => this.users.size);
	readonly adminName = computed(() => this.users.get(1)?.name ?? 'No admin');
	readonly entries = computed(() => [...this.users.entries()]);

	addUser() {
		const id = this.users.size + 1;
		this.users.set(id, { name: `User ${id}`, role: 'user' });
	}
}
```

You use the normal `Map` methods (`get`, `set`, `has`, `delete`, `clear`, `size`, `keys`, `values`, `entries`, `forEach`, `for...of`). There is no `.set()` on a signal to remember: the map itself is the reactive state.

## Fine-grained reactivity

`SignalMap` tracks two things separately:

- **Each key's value.** `get(key)` on an existing key tracks only that key.
- **The structure** (which keys exist). Adding or deleting a key notifies structure readers. Updating an existing key does not.

```ts
const counters = new SignalMap<string, number>([
	['a', 0],
	['b', 0],
]);

const a = computed(() => counters.get('a')); // tracks key 'a' only
const b = computed(() => counters.get('b')); // tracks key 'b' only
const size = computed(() => counters.size); // tracks structure only

counters.set('a', 1); // re-runs `a` only
counters.set('c', 0); // new key: re-runs `size`, not `a` or `b`
counters.delete('b'); // re-runs `b` and `size`
```

What each operation tracks when you read it reactively:

| Read                                             | Re-runs when                                         |
| ------------------------------------------------ | ---------------------------------------------------- |
| `get(key)` (key exists)                          | that key's value changes or the key is deleted       |
| `get(key)` (key missing)                         | any key is added or deleted                          |
| `has(key)`, `size`, `keys()`                     | any key is added or deleted                          |
| `values()`, `entries()`, `forEach()`, `for...of` | any key is added or deleted, or any value is updated |

| Write                            | Notifies                                                                   |
| -------------------------------- | -------------------------------------------------------------------------- |
| `set(key, value)` (new key)      | structure readers                                                          |
| `set(key, value)` (existing key) | readers of that key (only if the value changed, compared with `Object.is`) |
| `delete(key)`                    | readers of that key and structure readers                                  |
| `clear()`                        | readers of every key and structure readers (no-op on an empty map)         |

:::caution[Replace values, don't mutate them]
Values are compared with `Object.is`. To change an object stored in the map, set a new object (`map.set(id, { ...user, name })`). Mutating the stored object in place doesn't notify anyone.
:::

## Iteration

All iteration methods are reactive and work inside `computed`:

```ts
const users = new SignalMap<number, { name: string }>();

const ids = computed(() => [...users.keys()]);
const names = computed(() => [...users.values()].map((u) => u.name));
const entries = computed(() => [...users]); // same as entries()
```

## Edge cases

`undefined` is a valid value, separate from a missing key:

```ts
const map = new SignalMap<string, number | undefined>();
map.set('a', undefined);

map.has('a'); // true
map.get('a'); // undefined
map.has('b'); // false
```

Any value can be a key, including objects and symbols. Object keys are compared by identity, like a native `Map`.

## Example: an entity store

```ts
import { computed, Injectable } from '@angular/core';
import { SignalMap } from 'ngxtension/collections';

interface Todo {
	id: string;
	title: string;
	done: boolean;
}

@Injectable({ providedIn: 'root' })
export class TodoStore {
	private readonly todos = new SignalMap<string, Todo>();

	readonly all = computed(() => [...this.todos.values()]);
	readonly count = computed(() => this.todos.size);

	byId(id: string) {
		return computed(() => this.todos.get(id));
	}

	upsert(todo: Todo) {
		this.todos.set(todo.id, todo);
	}

	toggle(id: string) {
		const todo = this.todos.get(id);
		if (todo) {
			this.todos.set(id, { ...todo, done: !todo.done });
		}
	}

	remove(id: string) {
		this.todos.delete(id);
	}
}
```

## API

```ts
class SignalMap<K, V> {
	constructor(entries?: readonly (readonly [K, V])[] | null);

	get(key: K): V | undefined;
	set(key: K, value: V): this;
	has(key: K): boolean;
	delete(key: K): boolean;
	clear(): void;
	get size(): number;

	keys(): IterableIterator<K>;
	values(): IterableIterator<V>;
	entries(): IterableIterator<[K, V]>;
	forEach(callback: (value: V, key: K, map: SignalMap<K, V>) => void): void;
	[Symbol.iterator](): IterableIterator<[K, V]>;
}
```

The methods behave like their native `Map` counterparts: `set` returns the map for chaining, `delete` returns whether the key existed. `SignalMap` doesn't extend or implement `Map`, so it can't be passed where a `Map` type is required. Convert it with `new Map(signalMap)` when you need one.

`SignalMap` doesn't need an injection context; you can create it anywhere.

## Related

- [`SignalSet`](/utilities/signal-primitives/signal-set/) is the reactive `Set` counterpart.
- [`createNotifier`](/utilities/signal-primitives/create-notifier/) for making other mutable structures reactive.
