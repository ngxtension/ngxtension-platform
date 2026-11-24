---
title: on
description: Makes an effect's dependencies explicit inside effect(), and gives you the previous inputs and result.
entryPoint: ngxtension/reactive-on
badge: experimental
contributors: ['jeanmeche']
---

`on` wraps an effect callback so that only the signals you list are tracked; the rest of the body runs untracked. You pass the result straight to Angular's `effect()`. It also hands you the previous input values and the value your callback returned last time, which is handy for "what changed?" logic.

It is similar to [`explicitEffect`](/utilities/effects-side-effects/explicit-effect/), but you keep using `effect()` itself.

## Usage

```angular-ts
import { Component, effect, signal } from '@angular/core';
import { on } from 'ngxtension/reactive-on';

@Component({
	selector: 'app-counter',
	template: `<button (click)="count.set(count() + 1)">{{ count() }}</button>`,
})
export class Counter {
	readonly count = signal(0);
	readonly step = signal(1);

	constructor() {
		effect(
			on([this.count, this.step], ([count, step]) => {
				console.log(`count: ${count}, step: ${step}`);
			}),
		);
	}
}
```

This is equivalent to:

```ts
effect(() => {
	const count = this.count();
	const step = this.step();
	untracked(() => {
		console.log(`count: ${count}, step: ${step}`);
	});
});
```

## Dependencies

Pass one of:

- a single signal or function: `on(count, (count) => …)`
- an array: `on([a, b], ([a, b]) => …)`
- an object: `on({ a, b }, ({ a, b }) => …)`

Each dependency can be a signal or a function that reads signals, like `() => this.count() * 2`.

```ts
effect(
	on({ user: this.user, page: this.page }, ({ user, page }) => {
		console.log(user.name, page);
	}),
);
```

## Previous values

The callback receives four arguments:

1. the current input values,
2. the previous input values (`undefined` on the first run),
3. the value the callback returned on its previous run (`undefined` on the first run),
4. the `onCleanup` function of the effect.

```ts
effect(
	on(this.count, (count, prevCount, prevMessage) => {
		console.log(`now ${count}, before ${prevCount}`);
		console.log(`last message: ${prevMessage}`);

		// available as prevMessage on the next run
		return `Count was ${count}`;
	}),
);
```

## Cleanup

Register cleanup logic with the fourth argument. It runs before the next run and when the effect is destroyed:

```ts
effect(
	on(this.count, (count, _prevCount, _prevResult, onCleanup) => {
		const timer = setInterval(() => console.log(count), 1000);
		onCleanup(() => clearInterval(timer));
	}),
);
```

## Skip the first run

Pass `{ defer: true }` as the third argument to skip the effect's initial run:

```ts
effect(
	on(
		this.count,
		(count) => {
			console.log(`count changed to ${count}`);
		},
		{ defer: true },
	),
);
```

:::note
With `defer`, the skipped run doesn't record its inputs, so on the first real run the previous input is `undefined`, not the initial value.
:::

## API

```ts
// simplified; the real overloads infer DepsValues from deps
function on<U>(
	deps:
		| Accessor<unknown>
		| readonly Accessor<unknown>[]
		| Record<string, Accessor<unknown>>,
	fn: (
		input: DepsValues,
		prevInput: DepsValues | undefined,
		prevValue: U | undefined,
		onCleanup: EffectCleanupRegisterFn,
	) => U,
	options?: { defer?: boolean },
): (onCleanup: EffectCleanupRegisterFn) => void;

type Accessor<T> = Signal<T> | (() => T);
```

`DepsValues` has the same shape as `deps`: a single value, a tuple or an object.

| Option  | Type      | Default | Description                       |
| ------- | --------- | ------- | --------------------------------- |
| `defer` | `boolean` | `false` | Skip the first run of the effect. |

`on` returns a function you pass to `effect()`. Pass injector and other effect options to `effect()` as usual.
