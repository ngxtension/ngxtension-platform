---
title: explicitEffect
description: ngxtension/explicit-effect
entryPoint: explicit-effect
badge: stable
contributors: ['jeanmeche', 'enea-jahollari']
---

`explicitEffect` is a helper function that allows you to create an effect that only depends on the provided signals in the deps array.
It will run the effect function only when the signals in the deps array change.

Think about this pattern:

```ts
import { untracked } from '@angular/core';

effect(() => {
	// read the signals here
	const count = this.count();
	const state = this.state();

	// run the side effect as untracked to prevent any unnecessary signal reads or writes
	untracked(() => {
		log.push(`count updated ${count}, ${state}`);
	});
});
```

This pattern is very common in Angular apps, and it's used to prevent unnecessary signal reads or writes when the effect function is called.

`explicitEffect` is a helper function that does exactly this, but in a more explicit way.

```ts
explicitEffect([this.count, this.state], ([count, state]) => {
	log.push(`count updated ${count}, ${state}`);
});
```

```ts
import { explicitEffect } from 'ngxtension/explicit-effect';
```

## Usage

`explicitEffect` accepts an array of signals and a function that will be called when the signals change.
The deps array accepts:

- Signals (also computed signals)
- Writable signals
- Functions that have signal reads as dependencies (ex: `() => this.count()`)

```ts
const count = signal(0);
const state = signal('idle');
const doubleCount = computed(() => count() * 2);
const result = () => count() + doubleCount();

explicitEffect(
	[count, state, doubleCount, result],
	([count, state, doubleCount, result]) => {
		console.log(`count updated ${count}, ${state}, ${doubleCount}, ${result}`);
	},
);
```

## Cleanup

An optional second argument can be provided to the `explicitEffect` function that will be called when the effect is cleaned up.

```ts
const count = signal(0);
explicitEffect([count], ([count], cleanup) => {
	console.log(`count updated ${count}`);
	cleanup(() => console.log('cleanup'));
});
```

## Defer

In addition to the regular `effect` options, you can also pass a `defer` value as part of the third object argument of `explicitEffect`. This allows the computation not to execute immediately and only run on first deps change.

```ts
const count = signal(0);
explicitEffect(
	[count],
	([count]) => {
		console.log(`count updated ${count}`);
	},
	{ defer: true },
);

count.set(1); // this set will trigger the effect function call, not the initial value
```
