---
title: explicitEffect
description: An effect that only tracks the signals you list, and runs its body untracked.
entryPoint: ngxtension/explicit-effect
badge: stable
contributors: ['jeanmeche', 'enea-jahollari']
---

`explicitEffect` creates an effect that depends only on the signals you list. Everything inside the effect body runs untracked, so reading or writing other signals there never adds hidden dependencies. You see at a glance what makes the effect run.

It replaces this common pattern:

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

with:

```ts
explicitEffect([this.count, this.state], ([count, state]) => {
	log.push(`count updated ${count}, ${state}`);
});
```

## Usage

```angular-ts
import { Component, inject, signal } from '@angular/core';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { Analytics } from './analytics';

@Component({
	selector: 'app-search',
	template: `<input [value]="query()" (input)="query.set($any($event.target).value)" />`,
})
export class Search {
	private readonly analytics = inject(Analytics);

	readonly query = signal('');
	readonly page = signal(1);
	readonly userId = signal('anonymous');

	constructor() {
		// Runs when query or page change. Reading userId() inside doesn't make it a dependency.
		explicitEffect([this.query, this.page], ([query, page]) => {
			this.analytics.track('search', { query, page, user: this.userId() });
		});
	}
}
```

The deps array accepts any mix of:

- signals, including `input()` and `computed()` signals,
- writable signals,
- functions that read signals, such as `() => this.count() * 2`.

```ts
const count = signal(0);
const state = signal('idle');
const doubleCount = computed(() => count() * 2);
const sum = () => count() + doubleCount();

explicitEffect(
	[count, state, doubleCount, sum],
	([count, state, doubleCount, sum]) => {
		console.log(count, state, doubleCount, sum);
	},
);
```

The values arrive in the same order as the deps, with their types preserved.

## Cleanup

The callback receives an `onCleanup` function as its second argument. The cleanup runs before the next run and when the effect is destroyed:

```ts
explicitEffect([this.userId], ([userId], onCleanup) => {
	const timer = setInterval(() => this.poll(userId), 5000);
	onCleanup(() => clearInterval(timer));
});
```

## Skip the first run

Effects run once when created. Pass `defer: true` to skip that run and only react to later changes:

```ts
const count = signal(0);

explicitEffect(
	[count],
	([count]) => {
		console.log(`count changed to ${count}`);
	},
	{ defer: true },
);

count.set(1); // the callback runs for this change, not for the initial 0
```

## API

```ts
function explicitEffect<Input extends readonly unknown[], Params = Input>(
	deps: readonly [...{ [K in keyof Input]: () => Input[K] }],
	fn: (deps: Params, onCleanup: EffectCleanupRegisterFn) => void,
	options?: CreateEffectOptions & { defer?: boolean },
): EffectRef;
```

| Option          | Type       | Default         | Description                                                            |
| --------------- | ---------- | --------------- | ---------------------------------------------------------------------- |
| `defer`         | `boolean`  | `false`         | Skip the first run; only run on the first change of a dep.             |
| `injector`      | `Injector` | current context | Needed outside an injection context, like any `effect`.                |
| `manualCleanup` | `boolean`  | `false`         | Don't destroy the effect with its injector; call `destroy()` yourself. |

The other Angular `effect` options are passed through. Returns the `EffectRef`.

## Related

- [`on`](/utilities/effects-side-effects/on/) gives the same explicit dependencies inside a regular `effect()`, plus previous values.
- [`effectOnceIf`](/utilities/effects-side-effects/effect-once-if/) runs an effect once when a condition becomes true.
