---
title: injectAutoEffect
description: Captures the injector once, then lets you create effects anywhere (ngOnInit, afterNextRender, event handlers) without passing it.
entryPoint: ngxtension/auto-effect
badge: stable
contributors: ['chau-tran']
---

`injectAutoEffect` captures the current `Injector` and returns a function that creates effects with it. Angular's `effect()` needs an injection context, so outside the constructor (in `ngOnInit`, `afterNextRender`, an event handler or a `setTimeout`) you'd normally have to inject the `Injector` yourself and pass it every time. With `injectAutoEffect`, you call `autoEffect(() => …)` and the injector is wired in for you.

## Usage

```angular-ts
import { afterNextRender, Component, ElementRef, inject, signal } from '@angular/core';
import { injectAutoEffect } from 'ngxtension/auto-effect';

@Component({
	selector: 'app-chart',
	template: `<canvas></canvas>`,
})
export class Chart {
	private readonly autoEffect = injectAutoEffect();
	private readonly host = inject(ElementRef<HTMLElement>);

	readonly data = signal<number[]>([1, 2, 3]);

	constructor() {
		afterNextRender(() => {
			// not an injection context, but no injector needed
			const canvas = this.host.nativeElement.querySelector('canvas')!;
			this.autoEffect(() => {
				draw(canvas, this.data());
			});
		});
	}
}

function draw(canvas: HTMLCanvasElement, data: number[]) {
	/* ... */
}
```

The effect is tied to the injector captured by `injectAutoEffect()`, so it is destroyed with the component.

## Return a cleanup function

With `effect()`, you register cleanup through the `onCleanup` argument. With `autoEffect`, you can **return** the cleanup function instead. The two are equivalent; pick the style you prefer.

```ts
// Angular effect
effect((onCleanup) => {
	const sub = interval(1000).subscribe();
	onCleanup(() => sub.unsubscribe());
});

// autoEffect
this.autoEffect(() => {
	const sub = interval(1000).subscribe();
	return () => sub.unsubscribe();
});
```

The cleanup runs before the next run and when the effect is destroyed.

## Use the injector inside the effect

The callback receives the captured `Injector`, in case you need it for something else, such as `toSignal` or `runInInjectionContext`:

```ts
this.autoEffect((injector) => {
	const user = injector.get(UserService).user();
	console.log(user);
});
```

## Effect options

The second argument takes the usual Angular `effect` options, except `injector` (it is always the captured one):

```ts
const ref = this.autoEffect(() => console.log(this.data()), {
	manualCleanup: true,
});

// later
ref.destroy();
```

:::caution[No nested effects]
Angular doesn't allow creating an effect inside another effect, `computed` or template (it throws in dev mode). Call `autoEffect` from lifecycle hooks, callbacks and event handlers, not from inside another effect.
:::

## Pass an injector

Call `injectAutoEffect` in an injection context (a field initializer or constructor). To create it elsewhere, pass an injector:

```ts
const autoEffect = injectAutoEffect(this.injector);
```

## API

```ts
function injectAutoEffect(
	injector?: Injector,
): (
	autoEffectCallback: (autoEffectInjector: Injector) => void | (() => void),
	options?: Omit<CreateEffectOptions, 'injector'>,
) => EffectRef;
```

| Parameter            | Description                                                                     |
| -------------------- | ------------------------------------------------------------------------------- |
| `injector`           | Optional. The injector to capture. Defaults to the current injection context.   |
| `autoEffectCallback` | The effect body. Receives the captured injector. May return a cleanup function. |
| `options`            | Angular `effect` options without `injector`, for example `manualCleanup`.       |

## Related

If you only need an effect in one place, passing the injector directly is just as short: `effect(fn, { injector: this.injector })`.
