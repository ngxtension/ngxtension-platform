---
title: on
description: ngxtension/reactive-on
entryPoint: ngxtension/reactive-on
badge: new
contributors: ['jeanmeche']
---

`on` is a helper function that allows you to create an effect with explicit dependencies. It is designed to be used directly inside `effect()`.

It is similar to `explicitEffect`, but intended for inline usage within `effect()`.

## Usage

`on` accepts dependencies (a signal, an array of signals, or a record of signals) and a callback function. The callback is executed only when the dependencies change.

### Basic Usage

```ts
import { effect, signal } from '@angular/core';
import { on } from 'ngxtension/reactive-on';

const count = signal(0);
const doubleJson = signal(0);

effect(
	on([count, doubleJson], ([c, d]) => {
		console.log(`Count: ${c}, Double: ${d}`);
	}),
);
```

This is equivalent to:

```ts
effect(() => {
	const c = count();
	const d = doubleJson();
	untracked(() => {
		console.log(`Count: ${c}, Double: ${d}`);
	});
});
```

### Accessing Previous Values

The callback provides access to:

1. The current input values (dependencies).
2. The previous input values.
3. The returned value from the previous execution of the callback.

```ts
const count = signal(1);

effect(
	on(count, (currentCount, prevCount, prevResult) => {
		console.log(`Current: ${currentCount}`);
		console.log(`Previous Input: ${prevCount}`);
		console.log(`Previous Result: ${prevResult}`);

		// This value will be available as `prevResult` in the next run
		return `Count is ${currentCount}`;
	}),
);
```

### Defer Execution

You can defer the initial execution of the effect using the `defer` option.

```ts
effect(
	on(
		count,
		(value) => {
			console.log(`Value changed: ${value}`);
		},
		{ defer: true },
	),
);
```

### Cleanup Function

The callback receives a cleanup function registration callback as the last argument.

```ts
effect(
	on(count, (value, prev, prevVal, cleanup) => {
		const timer = setInterval(() => {
			console.log(value);
		}, 1000);

		cleanup(() => {
			clearInterval(timer);
		});
	}),
);
```
