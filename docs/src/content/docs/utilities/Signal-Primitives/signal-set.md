---
title: SignalSet
description: ngxtension/collections
entryPoint: ngxtension/collections
badge: stable
contributors: ['enea-jahollari']
---

`SignalSet` is a reactive Set implementation that integrates with Angular's signals system. It provides fine-grained reactivity, ensuring that changes to the set structure trigger only the necessary updates.

## Import

```typescript
import { SignalSet } from 'ngxtension/collections';
```

## Usage

### Basic Usage

```typescript
import { SignalSet } from 'ngxtension/collections';
import { Component, computed, effect } from '@angular/core';

@Component({
	selector: 'app-tag-manager',
	template: `
		<div>
			<p>Total tags: {{ totalTags() }}</p>
			<p>Has 'angular': {{ hasAngular() }}</p>
		</div>
	`,
})
export class TagManagerComponent {
	tags = new SignalSet<string>();

	totalTags = computed(() => this.tags.size);
	hasAngular = computed(() => this.tags.has('angular'));

	constructor() {
		// Initialize with data
		this.tags.add('angular');
		this.tags.add('typescript');
		this.tags.add('rxjs');

		// React to changes
		effect(() => {
			console.log('Tag count:', this.tags.size);
		});
	}
}
```

### Fine-Grained Reactivity

`SignalSet` provides structure-level reactivity, where all operations that check membership or iterate over values track the set's structure:

```typescript
import { SignalSet } from 'ngxtension/collections';
import { Component, computed, effect } from '@angular/core';

@Component({
	selector: 'app-feature-flags',
	template: `
		<div>
			<p>Feature X enabled: {{ featureX() }}</p>
			<p>Feature Y enabled: {{ featureY() }}</p>
			<p>Total features: {{ featureCount() }}</p>
		</div>
	`,
})
export class FeatureFlagsComponent {
	enabledFeatures = new SignalSet<string>();

	featureX = computed(() => this.enabledFeatures.has('feature-x'));
	featureY = computed(() => this.enabledFeatures.has('feature-y'));
	featureCount = computed(() => this.enabledFeatures.size);

	constructor() {
		// This effect runs when the set structure changes
		effect(() => {
			console.log('Enabled features:', Array.from(this.enabledFeatures));
		});

		this.enabledFeatures.add('feature-x');
		this.enabledFeatures.add('feature-y');

		// Adding duplicate does not trigger effects
		this.enabledFeatures.add('feature-x'); // No effect triggered
	}
}
```

### Initialization

```typescript
// Empty set
const set = new SignalSet<string>();

// With initial values
const set = new SignalSet<string>(['a', 'b', 'c']);

// Duplicates are automatically handled
const set = new SignalSet<string>(['a', 'b', 'a']); // size: 2
```

### Iteration

`SignalSet` supports standard Set iteration methods that are fully reactive:

```typescript
import { SignalSet } from 'ngxtension/collections';
import { Component, computed } from '@angular/core';

@Component({
	selector: 'app-tag-list',
	template: `
		<ul>
			@for (tag of allTags(); track tag) {
				<li>{{ tag }}</li>
			}
		</ul>
	`,
})
export class TagListComponent {
	tags = new SignalSet<string>();

	// All iteration methods are reactive
	allTags = computed(() => Array.from(this.tags.values()));
	sortedTags = computed(() => Array.from(this.tags).sort());

	constructor() {
		this.tags.add('angular');
		this.tags.add('typescript');

		// Using forEach
		const upperCaseTags = computed(() => {
			const result: string[] = [];
			this.tags.forEach((tag) => {
				result.push(tag.toUpperCase());
			});
			return result;
		});

		// Using for...of (SignalSet is iterable)
		const tagList = computed(() => {
			const result: string[] = [];
			for (const tag of this.tags) {
				result.push(tag);
			}
			return result;
		});

		// Using spread operator
		const tagArray = computed(() => [...this.tags]);
	}
}
```

## API

### Constructor

```typescript
constructor(values?: readonly T[] | null)
```

Creates a new `SignalSet` instance, optionally initialized with values. Duplicate values are automatically handled.

**Parameters:**

- `values` - Optional array of values to initialize the set

**Example:**

```typescript
const set = new SignalSet<string>(['a', 'b', 'c']);
```

### Methods

#### `has(value: T): boolean`

Checks if a value exists in the set. This operation tracks structure changes.

**Returns:** `true` if the value exists, `false` otherwise

**Example:**

```typescript
const exists = computed(() => set.has('value'));
```

#### `add(value: T): this`

Adds a value to the set. Returns `this` for method chaining. If the value already exists, the set is unchanged.

**Key behavior:**

- If the value is new, adds it and triggers structure changes
- If the value exists, does nothing (no effects triggered)

**Example:**

```typescript
set.add('a').add('b').add('c');
```

#### `delete(value: T): boolean`

Removes a value from the set.

**Returns:** `true` if the value existed and was deleted, `false` otherwise

**Example:**

```typescript
const deleted = set.delete('value');
```

#### `clear(): void`

Removes all values from the set. Triggers structure changes if the set was not empty.

**Example:**

```typescript
set.clear();
```

#### `keys(): IterableIterator<T>`

Returns an iterator of all values (for Sets, keys() and values() are the same). This operation tracks structure changes.

**Example:**

```typescript
const allKeys = computed(() => Array.from(set.keys()));
```

#### `values(): IterableIterator<T>`

Returns an iterator of all values. This operation tracks structure changes.

**Example:**

```typescript
const allValues = computed(() => Array.from(set.values()));
```

#### `entries(): IterableIterator<[T, T]>`

Returns an iterator of `[value, value]` pairs (for Set API compatibility). This operation tracks structure changes.

**Example:**

```typescript
const allEntries = computed(() => Array.from(set.entries()));
```

#### `forEach(callback: (value: T, value2: T, set: SignalSet<T>) => void): void`

Executes a callback for each value in the set. Following Set API convention, the callback receives the value twice. This operation tracks structure changes.

**Example:**

```typescript
set.forEach((value) => {
	console.log(value);
});
```

#### `[Symbol.iterator](): IterableIterator<T>`

Makes `SignalSet` iterable, allowing it to be used with `for...of` loops and spread operators. Returns the same iterator as `values()`.

**Example:**

```typescript
// for...of loop
for (const value of set) {
	console.log(value);
}

// Spread operator
const values = [...set];

// Array.from
const valuesArray = Array.from(set);
```

### Properties

#### `size: number`

Gets the number of values in the set. This property tracks structure changes.

**Example:**

```typescript
const count = computed(() => set.size);
```

## Reactivity Model

`SignalSet` implements structure-level reactivity:

### Structure-Level Reactivity

All operations track the set's structure signal:

- `size`, `has()`, `keys()`, `values()`, `entries()`, and `forEach()` track structure
- Adding new values triggers structure changes
- Adding duplicate values does NOT trigger structure changes
- Deleting values triggers structure changes

This ensures optimal performance by only triggering updates when the set's membership actually changes.

## Edge Cases

### Supporting Special Values

`SignalSet` correctly handles special JavaScript values:

```typescript
// undefined
const set = new SignalSet<undefined>();
set.add(undefined);
set.has(undefined); // true

// null
const set2 = new SignalSet<null | string>();
set2.add(null);
set2.add('value');
set2.has(null); // true

// Empty string and zero
const set3 = new SignalSet<string | number>();
set3.add('');
set3.add(0);
set3.has(''); // true
set3.has(0); // true

// Boolean values
const set4 = new SignalSet<boolean>();
set4.add(true);
set4.add(false);
set4.size; // 2

// NaN (treated as equal to NaN, following Set behavior)
const set5 = new SignalSet<number>();
set5.add(NaN);
set5.add(NaN); // Duplicate, not added again
set5.size; // 1
```

### Working with Complex Types

```typescript
interface User {
	id: number;
	name: string;
}

const user1: User = { id: 1, name: 'Alice' };
const user2: User = { id: 2, name: 'Bob' };

const users = new SignalSet<User>();
users.add(user1);
users.add(user2);

// Object identity is used for comparison
users.has(user1); // true
users.has({ id: 1, name: 'Alice' }); // false (different object)
```

### Using Symbol Values

`SignalSet` supports symbols as values:

```typescript
const sym1 = Symbol('test1');
const sym2 = Symbol('test2');

const set = new SignalSet<symbol>();
set.add(sym1);
set.add(sym2);

set.has(sym1); // true
set.has(sym2); // true
set.size; // 2
```

## Set Operations

You can implement common set operations using `SignalSet`:

```typescript
const set1 = new SignalSet<number>([1, 2, 3]);
const set2 = new SignalSet<number>([2, 3, 4]);

// Union
const union = computed(() => {
	const result = new Set<number>();
	for (const v of set1) result.add(v);
	for (const v of set2) result.add(v);
	return result;
});
// Result: Set {1, 2, 3, 4}

// Intersection
const intersection = computed(() => {
	const result = new Set<number>();
	for (const v of set1) {
		if (set2.has(v)) result.add(v);
	}
	return result;
});
// Result: Set {2, 3}

// Difference
const difference = computed(() => {
	const result = new Set<number>();
	for (const v of set1) {
		if (!set2.has(v)) result.add(v);
	}
	return result;
});
// Result: Set {1}

// Symmetric Difference
const symmetricDiff = computed(() => {
	const result = new Set<number>();
	for (const v of set1) {
		if (!set2.has(v)) result.add(v);
	}
	for (const v of set2) {
		if (!set1.has(v)) result.add(v);
	}
	return result;
});
// Result: Set {1, 4}
```

## Performance Considerations

- **Efficient duplicate handling**: Adding duplicates is a no-op and doesn't trigger effects
- **Structure tracking only**: Only operations that change membership trigger updates
- **Memory efficient**: Uses native Map under the hood with signal wrappers
- **Bulk operations**: `clear()` efficiently notifies all affected signals at once
- **Maintains insertion order**: Like native Set, iteration order is insertion order

## Use Cases

### Feature Flags Management

```typescript
class FeatureFlags {
	private flags = new SignalSet<string>();

	isEnabled = (flag: string) => computed(() => this.flags.has(flag));
	allFlags = computed(() => Array.from(this.flags));
	flagCount = computed(() => this.flags.size);

	enable(flag: string) {
		this.flags.add(flag);
	}

	disable(flag: string) {
		this.flags.delete(flag);
	}

	toggle(flag: string) {
		if (this.flags.has(flag)) {
			this.flags.delete(flag);
		} else {
			this.flags.add(flag);
		}
	}

	reset() {
		this.flags.clear();
	}
}
```

### Tag System

```typescript
class TagManager {
	private tags = new SignalSet<string>();

	allTags = computed(() => Array.from(this.tags).sort());
	tagCount = computed(() => this.tags.size);
	hasTag = (tag: string) => computed(() => this.tags.has(tag));

	addTag(tag: string) {
		this.tags.add(tag.toLowerCase().trim());
	}

	removeTag(tag: string) {
		this.tags.delete(tag.toLowerCase().trim());
	}

	addTags(tags: string[]) {
		tags.forEach((tag) => this.addTag(tag));
	}

	clearTags() {
		this.tags.clear();
	}
}
```

### Selection Management

```typescript
class SelectionManager<T> {
	private selected = new SignalSet<T>();

	isSelected = (item: T) => computed(() => this.selected.has(item));
	selectedItems = computed(() => Array.from(this.selected));
	selectedCount = computed(() => this.selected.size);
	hasSelection = computed(() => this.selected.size > 0);

	select(item: T) {
		this.selected.add(item);
	}

	deselect(item: T) {
		this.selected.delete(item);
	}

	toggle(item: T) {
		if (this.selected.has(item)) {
			this.selected.delete(item);
		} else {
			this.selected.add(item);
		}
	}

	selectAll(items: T[]) {
		items.forEach((item) => this.selected.add(item));
	}

	clearSelection() {
		this.selected.clear();
	}
}
```

### Unique ID Tracking

```typescript
class IdRegistry {
	private ids = new SignalSet<string>();

	isRegistered = (id: string) => computed(() => this.ids.has(id));
	allIds = computed(() => Array.from(this.ids));
	count = computed(() => this.ids.size);

	register(id: string): boolean {
		if (this.ids.has(id)) {
			return false; // Already registered
		}
		this.ids.add(id);
		return true;
	}

	unregister(id: string): boolean {
		return this.ids.delete(id);
	}

	clear() {
		this.ids.clear();
	}
}
```

## Comparison with Regular Set

| Feature             | Regular Set  | SignalSet                 |
| ------------------- | ------------ | ------------------------- |
| Reactivity          | ❌ No        | ✅ Yes                    |
| Works with computed | ❌ No        | ✅ Yes                    |
| Works with effect   | ❌ No        | ✅ Yes                    |
| Duplicate handling  | ✅ Yes       | ✅ Yes                    |
| Insertion order     | ✅ Yes       | ✅ Yes                    |
| Memory overhead     | Lower        | Slightly higher (signals) |
| API compatibility   | Full Set API | Core Set methods          |

## Interoperability

`SignalSet` can be easily converted to and from regular Sets:

```typescript
// SignalSet to regular Set
const signalSet = new SignalSet<string>(['a', 'b', 'c']);
const regularSet = new Set(signalSet);

// Regular Set to SignalSet
const regularSet2 = new Set(['x', 'y', 'z']);
const signalSet2 = new SignalSet(Array.from(regularSet2));
```

## See Also

- [SignalMap](./signal-map.md) - Reactive Map implementation with fine-grained key tracking
- [SignalObject](./signal-object.md) - Reactive object with typed keys
- [Angular Signals](https://angular.io/guide/signals) - Official Angular Signals guide
