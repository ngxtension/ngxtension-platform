---
title: createSignal / createComputed
description: Create signals and computeds that you can read and write through a `.value` property.
entryPoint: ngxtension/create-signal
badge: stable
contributors: ['enea-jahollari']
---

`createSignal` and `createComputed` create a normal Angular signal or computed and add a `value` property to it. You read and write the signal through `.value`, like [Vue's `ref`](https://vuejs.org/api/reactivity-core.html#ref) or [Preact signals](https://preactjs.com/guide/v10/signals/). Reading `.value` is tracked exactly like calling the signal.

## Usage

```angular-ts
import { Component } from '@angular/core';
import { createComputed, createSignal } from 'ngxtension/create-signal';

@Component({
	selector: 'app-counter',
	template: `
		<p>{{ count.value }} x 2 = {{ double.value }}</p>
		<button (click)="increment()">+1</button>
	`,
})
export class Counter {
	readonly count = createSignal(0);
	readonly double = createComputed(() => this.count.value * 2);

	increment() {
		this.count.value = this.count.value + 1; // same as count.set(count() + 1)
	}
}
```

The result is still a real signal, so `count()`, `count.set()` and `count.update()` keep working:

```ts
const state = createSignal({ count: 0 });

effect(() => {
	console.log(state.value.count); // tracked, like state().count
});
// logs: 0

state.value = { count: 1 }; // same as state.set({ count: 1 })
// logs: 1

const double = createComputed(() => state.value.count * 2);
console.log(double.value); // 2
```

:::note
Assigning `.value` calls `set()`, so it replaces the whole value. Mutating a nested property (`state.value.count = 2`) does not notify anyone. Assign a new object instead.
:::

## API

```ts
function createSignal<T>(
	...args: Parameters<typeof signal<T>>
): WritableSignal<T> & { value: T };

function createComputed<T>(
	...args: Parameters<typeof computed<T>>
): Signal<T> & { value: T };
```

- `createSignal` takes the same arguments as `signal()` (initial value and optional `CreateSignalOptions`). Reading `.value` reads the signal; assigning `.value` calls `set()`.
- `createComputed` takes the same arguments as `computed()` (computation and optional `CreateComputedOptions`). `.value` is read-only.
