---
title: createSignal / createComputed
description: ngxtension/create-signal
entryPoint: create-signal
badge: stable
contributor: enea-jahollari
---

`createSignal` and `createComputed` are helper functions that create a `Signal` or `Computed` and return it with a `value` property.

It mimics the style of [vue.js ref](https://vuejs.org/api/reactivity-core.html#ref) and [preact signals](https://preactjs.com/guide/v10/signals/#signalinitialvalue) where the `value` property is used to get and set the value of the `Signal` or `Computed`.

## Usage

```ts
import { createSignal, createComputed } from 'ngxtension/create-signal';

const state = createSignal({ count: 0 });

effect(() => {
	// Works as expected
	console.log(state.value.count);
});

// Effect will log: 1

state.value = { count: 1 }; // Sets the value

// Effect will log: 1

const double = createComputed(() => state.value.count * 2);

console.log(double.value); // Logs 2
```

## API

### `createSignal`

```ts
function createSignal<T>(
	...args: Parameters<typeof signal<T>>
): WritableSignal<T> & { value: T };
```

Creates a writable signal with a `value` property.

### `createComputed`

```ts
function createComputed<T>(
	...args: Parameters<typeof computed<T>>
): Signal<T> & { value: T };
```

Creates a computed under the hood and returns it with a `value` property.
