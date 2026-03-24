---
title: SignalMap
description: ngxtension/collections
entryPoint: ngxtension/collections
badge: stable
contributors: ['enea-jahollari']
---

`SignalMap` is a reactive Map implementation that integrates with Angular's signals system. It provides fine-grained reactivity, ensuring that changes to individual keys or the map structure trigger only the necessary updates.

## Import

```typescript
import { SignalMap } from 'ngxtension/collections';
```

## Usage

### Basic Usage

```typescript
import { SignalMap } from 'ngxtension/collections';
import { Component, computed, effect } from '@angular/core';

@Component({
	selector: 'app-user-manager',
	template: `
		<div>
			<p>Total users: {{ totalUsers() }}</p>
			<p>Admin name: {{ adminName() }}</p>
		</div>
	`,
})
export class UserManagerComponent {
	readonly users = new SignalMap<number, { name: string; role: string }>();

	readonly totalUsers = computed(() => this.users.size);
	readonly adminName = computed(() => this.users.get(1)?.name ?? 'No admin');

	constructor() {
		// Initialize with data
		this.users.set(1, { name: 'Alice', role: 'admin' });
		this.users.set(2, { name: 'Bob', role: 'user' });

		// React to changes
		effect(() => {
			console.log('User count:', this.users.size);
		});
	}
}
```

### Fine-Grained Reactivity

One of the key features of `SignalMap` is its fine-grained reactivity. Changes to individual keys only trigger effects that depend on those specific keys, not all effects watching the map.

```typescript
import { SignalMap } from 'ngxtension/collections';
import { Component, computed, effect } from '@angular/core';

@Component({
	selector: 'app-counter',
	template: `
		<div>
			<p>Counter A: {{ counterA() }}</p>
			<p>Counter B: {{ counterB() }}</p>
		</div>
	`,
})
export class CounterComponent {
	counters = new SignalMap<string, number>();

	counterA = computed(() => this.counters.get('a') ?? 0);
	counterB = computed(() => this.counters.get('b') ?? 0);

	constructor() {
		this.counters.set('a', 0);
		this.counters.set('b', 0);

		// This effect only runs when 'a' changes
		effect(() => {
			console.log('Counter A changed:', this.counters.get('a'));
		});

		// This effect only runs when 'b' changes
		effect(() => {
			console.log('Counter B changed:', this.counters.get('b'));
		});

		// Updating 'a' won't trigger the effect watching 'b'
		this.counters.set('a', 1); // Only first effect runs
		this.counters.set('b', 1); // Only second effect runs
	}
}
```

### Initialization

```typescript
// Empty map
const map = new SignalMap<string, number>();

// With initial entries
const map = new SignalMap<string, number>([
	['a', 1],
	['b', 2],
	['c', 3],
]);
```

### Iteration

`SignalMap` supports standard Map iteration methods that are fully reactive:

```typescript
import { SignalMap } from 'ngxtension/collections';
import { Component, computed } from '@angular/core';

@Component({
	selector: 'app-user-list',
	template: `
		<ul>
			@for (user of allUsers(); track user[0]) {
				<li>{{ user[1].name }}</li>
			}
		</ul>
	`,
})
export class UserListComponent {
	users = new SignalMap<number, { name: string }>();

	// All iteration methods are reactive
	allUsers = computed(() => Array.from(this.users.entries()));
	allNames = computed(() => Array.from(this.users.values()).map((u) => u.name));
	allIds = computed(() => Array.from(this.users.keys()));

	constructor() {
		this.users.set(1, { name: 'Alice' });
		this.users.set(2, { name: 'Bob' });

		// Using forEach
		const totalComputed = computed(() => {
			let sum = 0;
			this.users.forEach((_, key) => {
				sum += key;
			});
			return sum;
		});

		// Using for...of (SignalMap is iterable)
		const namesComputed = computed(() => {
			const names: string[] = [];
			for (const [_, user] of this.users) {
				names.push(user.name);
			}
			return names;
		});

		// Using spread operator
		const entriesArray = computed(() => [...this.users]);
	}
}
```

## API

### Constructor

```typescript
constructor(entries?: readonly (readonly [K, V])[] | null)
```

Creates a new `SignalMap` instance, optionally initialized with entries.

**Parameters:**

- `entries` - Optional array of key-value pairs to initialize the map

**Example:**

```typescript
const map = new SignalMap<string, number>([
	['a', 1],
	['b', 2],
]);
```

### Methods

#### `get(key: K): V | undefined`

Retrieves the value for a given key. This operation is reactive and will track both:

- Changes to the specific key's value
- Addition of the key if it doesn't exist

**Returns:** The value associated with the key, or `undefined` if not found

**Example:**

```typescript
const value = computed(() => map.get('key'));
```

#### `set(key: K, value: V): this`

Sets a value for a given key. Returns `this` for method chaining.

**Key behavior:**

- If the key exists, only updates the value (doesn't trigger structure changes)
- If the key is new, adds it to the map and triggers structure changes

**Example:**

```typescript
map.set('a', 1).set('b', 2).set('c', 3);
```

#### `delete(key: K): boolean`

Removes a key-value pair from the map.

**Returns:** `true` if the key existed and was deleted, `false` otherwise

**Example:**

```typescript
const deleted = map.delete('key');
```

#### `has(key: K): boolean`

Checks if a key exists in the map. This operation tracks structure changes.

**Returns:** `true` if the key exists, `false` otherwise

**Example:**

```typescript
const exists = computed(() => map.has('key'));
```

#### `clear(): void`

Removes all entries from the map. Triggers both value changes for all existing keys and a structure change.

**Example:**

```typescript
map.clear();
```

#### `keys(): IterableIterator<K>`

Returns an iterator of all keys. This operation tracks structure changes.

**Example:**

```typescript
const allKeys = computed(() => Array.from(map.keys()));
```

#### `values(): IterableIterator<V>`

Returns an iterator of all values. This operation tracks structure changes.

**Example:**

```typescript
const allValues = computed(() => Array.from(map.values()));
```

#### `entries(): IterableIterator<[K, V]>`

Returns an iterator of all key-value pairs. This operation tracks structure changes.

**Example:**

```typescript
const allEntries = computed(() => Array.from(map.entries()));
```

#### `forEach(callback: (value: V, key: K, map: SignalMap<K, V>) => void): void`

Executes a callback for each entry in the map. This operation tracks structure changes.

**Example:**

```typescript
map.forEach((value, key) => {
	console.log(`${key}: ${value}`);
});
```

#### `[Symbol.iterator](): IterableIterator<[K, V]>`

Makes `SignalMap` iterable, allowing it to be used with `for...of` loops and spread operators. Returns the same iterator as `entries()`.

**Example:**

```typescript
// for...of loop
for (const [key, value] of map) {
	console.log(`${key}: ${value}`);
}

// Spread operator
const entries = [...map];

// Array.from
const entriesArray = Array.from(map);
```

### Properties

#### `size: number`

Gets the number of entries in the map. This property tracks structure changes.

**Example:**

```typescript
const count = computed(() => map.size);
```

## Reactivity Model

`SignalMap` implements a sophisticated reactivity model with two levels of tracking:

### 1. Value-Level Reactivity

Each key in the map has its own signal. When you call `get(key)`:

- If the key exists, you track that specific key's signal
- Changes to that key's value will trigger your computed/effect
- Changes to other keys won't affect you

### 2. Structure-Level Reactivity

Operations that change the map's structure (keys, size) use a separate structure signal:

- `size`, `has()`, `keys()`, `values()`, `entries()`, and `forEach()` track structure
- Adding new keys or deleting keys triggers structure changes
- Updating existing key values does NOT trigger structure changes

This dual-tracking system ensures optimal performance by minimizing unnecessary updates.

## Edge Cases

### Supporting `undefined` as a Value

`SignalMap` correctly handles `undefined` as a legitimate value, distinguishing it from missing keys:

```typescript
const map = new SignalMap<string, number | undefined>();
map.set('a', undefined);

map.has('a'); // true
map.get('a'); // undefined

// Different from a missing key
map.get('b'); // undefined (but 'b' doesn't exist)
map.has('b'); // false
```

### Working with Complex Types

```typescript
interface User {
	id: number;
	name: string;
	metadata?: Record<string, unknown>;
}

const users = new SignalMap<number, User>();
users.set(1, { id: 1, name: 'Alice' });

// Update entire object (triggers reactive update)
users.set(1, { id: 1, name: 'Alice Updated' });

// The computed will reflect the new value
const userName = computed(() => users.get(1)?.name);
```

### Using Non-Primitive Keys

`SignalMap` supports any type as keys, including objects and symbols:

```typescript
const objKey = { id: 1 };
const symKey = Symbol('unique');

const map = new SignalMap<object | symbol, string>();
map.set(objKey, 'object value');
map.set(symKey, 'symbol value');

map.get(objKey); // 'object value'
map.get(symKey); // 'symbol value'
```

## Performance Considerations

- **Fine-grained updates**: Only computations depending on changed keys re-run
- **Efficient iteration**: Structure operations only trigger when keys are added/removed
- **Memory efficient**: Uses native Map under the hood with signal wrappers
- **Bulk operations**: `clear()` efficiently notifies all affected signals at once

## Use Cases

### State Management

```typescript
class TodoStore {
	private todos = new SignalMap<string, Todo>();

	getTodo = (id: string) => computed(() => this.todos.get(id));
	allTodos = computed(() => Array.from(this.todos.values()));
	todoCount = computed(() => this.todos.size);

	addTodo(todo: Todo) {
		this.todos.set(todo.id, todo);
	}

	updateTodo(id: string, updates: Partial<Todo>) {
		const todo = this.todos.get(id);
		if (todo) {
			this.todos.set(id, { ...todo, ...updates });
		}
	}

	deleteTodo(id: string) {
		this.todos.delete(id);
	}
}
```

### Caching

```typescript
class DataCache {
	private cache = new SignalMap<string, { data: unknown; timestamp: number }>();

	getCached = (key: string) =>
		computed(() => {
			const entry = this.cache.get(key);
			if (!entry) return null;

			const isExpired = Date.now() - entry.timestamp > 60000; // 1 minute
			return isExpired ? null : entry.data;
		});

	set(key: string, data: unknown) {
		this.cache.set(key, { data, timestamp: Date.now() });
	}

	clear() {
		this.cache.clear();
	}
}
```

### Entity Management

```typescript
class EntityManager<T extends { id: string }> {
	private entities = new SignalMap<string, T>();

	getById = (id: string) => computed(() => this.entities.get(id));
	getAll = computed(() => Array.from(this.entities.values()));
	count = computed(() => this.entities.size);

	upsert(entity: T) {
		this.entities.set(entity.id, entity);
	}

	remove(id: string) {
		return this.entities.delete(id);
	}

	exists(id: string) {
		return computed(() => this.entities.has(id));
	}
}
```

## Comparison with Regular Map

| Feature              | Regular Map  | SignalMap                 |
| -------------------- | ------------ | ------------------------- |
| Reactivity           | ❌ No        | ✅ Yes                    |
| Fine-grained updates | ❌ No        | ✅ Yes (per-key)          |
| Works with computed  | ❌ No        | ✅ Yes                    |
| Works with effect    | ❌ No        | ✅ Yes                    |
| Memory overhead      | Lower        | Slightly higher (signals) |
| API compatibility    | Full Map API | Core Map methods          |

## See Also

- [Angular Signals](https://angular.io/guide/signals) - Official Angular Signals guide
