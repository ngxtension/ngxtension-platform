---
title: effectOnceIf
description: Runs a side effect a single time, the first time a condition becomes truthy, then destroys itself.
entryPoint: ngxtension/effect-once-if
badge: stable
contributors: ['lorenzo-dianni']
---

`effectOnceIf` watches a condition and runs your callback the first time the condition returns a truthy value. After that single run the effect destroys itself, so you don't need flags like `hasRun` or a manual `effectRef.destroy()`. Use it for one-time work such as showing an onboarding tip, focusing an element after data arrives, or logging the first time a threshold is crossed.

## Usage

```angular-ts
import { Component, signal } from '@angular/core';
import { effectOnceIf } from 'ngxtension/effect-once-if';

@Component({
	selector: 'app-clicker',
	template: `<button (click)="count.set(count() + 1)">Clicked {{ count() }} times</button>`,
})
export class Clicker {
	readonly count = signal(0);

	constructor() {
		effectOnceIf(
			() => this.count() > 3,
			() => {
				console.log('You found the button!');
			},
		);
	}
}
```

```text
count.set(1) → nothing happens
count.set(4) → logs "You found the button!"
count.set(6) → nothing happens, the effect is gone
```

If the condition is already truthy when the effect first runs, the callback runs right away.

## Use the condition's value

The callback receives what the condition returned, without `null` and `undefined` in its type. This lets the condition double as a lookup:

```ts
effectOnceIf(
	() => this.user(), // User | undefined
	(user) => {
		// user is User here
		this.analytics.identify(user.id);
	},
);
```

Only the condition is tracked. The callback runs untracked, so signals you read inside it don't add dependencies.

## Cleanup

The callback also receives `onCleanup`. Because the effect is destroyed right after the callback runs, the cleanup runs immediately after it as well. Use it only for synchronous teardown; for something that should outlive the callback (a timer, a subscription), manage it yourself.

```ts
effectOnceIf(
	() => this.ready(),
	(_ready, onCleanup) => {
		console.log('ready');
		onCleanup(() => console.log('effect destroyed'));
	},
);
// logs: "ready", then "effect destroyed"
```

## API

```ts
function effectOnceIf<T = any>(
	condition: () => T,
	execution: (
		valueFromCondition: NonNullable<T>,
		onCleanup: EffectCleanupRegisterFn,
	) => void,
	options?: Omit<CreateEffectOptions, 'manualCleanup'>,
): EffectRef;
```

| Parameter   | Description                                                                                    |
| ----------- | ---------------------------------------------------------------------------------------------- |
| `condition` | Tracked. The callback runs the first time it returns a truthy value.                           |
| `execution` | Runs once, untracked, with the condition's value and `onCleanup`.                              |
| `options`   | Angular `effect` options except `manualCleanup`. Pass `injector` outside an injection context. |

Returns the `EffectRef`. Call `destroy()` on it to cancel the effect before the condition is ever met. If the injector is destroyed first (for example the component), the effect is cleaned up without running.
