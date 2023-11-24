---
title: injectAutoEffect
description: ngxtension/auto-effect
badge: stable
contributor: Chau Tran
---

`injectAutoEffect` is a CIF that returns an _auto-wired_ `Effect`, hence the name `auto-effect`. This `Effect` can be used in places that do not have an **implicit** Injection Context like `ngOnInit` or `afterNextRender`

```ts
import { injectAutoEffect } from 'ngxtension/auto-effect';
```

## Usage

```ts
@Component()
export class MyComponent {
	@Input({ required: true }) data!: Signal<Data>;

	private autoEffect = injectAutoEffect();

	constructor() {
		// This WON'T WORK because `data` input has not been resolved yet
		effect(() => {
			console.log(this.data());
		});
	}

	ngOnInit() {
		// `data` Input is not resolved until `ngOnInit` is invoked
		this.autoEffect(() => {
			console.log(this.data());
		});
	}
}
```

### Clean up function

Normal `effect()` can optionally invoke `onCleanup` argument to run some clean-up logic every time the `Effect` invokes.

```ts
effect((onCleanup) => {
  const sub = interval(1000).subscribe():
  onCleanup(() => sub.unsubscribe());
})
```

`injectAutoEffect()` allows the consumers to **return** a `CleanUpFn` instead. This is purely preference and has no affect
on performance of `effect()`

```ts
const autoEffect = injectAutoEffect();
autoEffect(() => {
  const sub = interval(1000).subscribe():
  return () => sub.unsubscribe();
})
```

### Nested Effect

For normal `effect`, we always need to pass in the `Injector` to the 2nd parameter of nested `effect()`.

```ts
effect((onCleanup) => {
	const innerEffectRef = effect(
		() => {
			/* inner effect logic */
		},
		{ manualCleanup: true, injector: injector }
	);
	onCleanup(() => innerEffectRef.destroy());
});
```

For `injectAutoEffect()`, `autoEffect` will always be invoked with the initial `Injector` (where we invoke `injectAutoEffect()`).

```ts
const autoEffect = injectAutoEffect();
autoEffect(() => {
	const innerEffectRef = autoEffect(
		() => {
			/* inner effect logic */
		},
		{ manualCleanup: true }
	);
	return () => innerEffectRef.destroy();
});
```

Optionally, `autoEffect` callback exposes the `Injector` so consumers can make use of that if needed

```ts
const autoEffect = injectAutoEffect();
autoEffect((injector) => {
	/* do something */
});
```
