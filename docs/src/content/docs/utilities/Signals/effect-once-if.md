---
title: effectOnceIf
description: ngxtension/effect-once-if
entryPoint: effect-once-if
badge: stable
contributors: ['lorenzo-dianni']
---

`effectOnceIf` is a helper function that allows you to create an effect that will be executed only once if a certain condition occurs.

## Usage

```ts
@Component({})
class Example {
	count = signal(0);

	effectOnceIfRef = effectOnceIf(
		// condition function: if it returns a truly value, the execution function will run
		() => this.count() > 3,
		// execution function: will run only once
		(valueReturnedFromCondition, onCleanup) => {
			console.log(
				`triggered with value returned: ${valueReturnedFromCondition}`,
			);
			onCleanup(() => console.log('cleanup'));
		},
	);
}

// example.count.set(1);
//    -> nothing happens
// example.count.set(4);
//    -> log: triggered with value returned: true
//    -> log: cleanup
// example.count.set(6);
//    -> nothing happens
```
