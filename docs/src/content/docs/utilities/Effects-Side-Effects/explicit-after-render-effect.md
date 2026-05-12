---
title: explicitAfterRenderEffect
description: ngxtension/explicit-after-render-effect
entryPoint: ngxtension/explicit-after-render-effect
badge: stable
contributors: ['jonata-biondi']
---

`explicitAfterRenderEffect` is the render-phase counterpart of [`explicitEffect`](./explicit-effect). It wraps Angular's `afterRenderEffect` so the effect re-runs only when the signals (or signal-reading functions) listed in the deps array change — any other signal read inside the body is ignored.

This is useful when you reach for `afterRenderEffect` to do DOM measurement or layout writes and don't want every transitive signal read in the callback to retrigger a render-phase callback.

```ts
import { explicitAfterRenderEffect } from 'ngxtension/explicit-after-render-effect';
```

## Usage

The single-callback form is the convenience overload. The callback runs in the `read` phase and re-runs only when one of the listed deps changes.

```ts
const width = signal(0);

explicitAfterRenderEffect([width], ([width]) => {
	console.log('width changed to', width);
});
```

The deps array accepts:

- Signals (also computed signals)
- Writable signals
- Functions that read signals (e.g. `() => this.count()`)

```ts
const count = signal(0);
const state = signal('idle');
const sum = () => count() * 2;

explicitAfterRenderEffect([count, state, sum], ([count, state, sum]) => {
	console.log({ count, state, sum });
});
```

## Phases

`afterRenderEffect` exposes four phases — `earlyRead`, `write`, `mixedReadWrite`, `read` — that run in that fixed order. Pass an object instead of a single function to opt into the multi-phase form. Each phase receives the resolved deps as its first argument and a `Signal` of the previous phase's return value as its second argument.

```ts
explicitAfterRenderEffect([el, width], {
	earlyRead: ([el]) => el.getBoundingClientRect().height,
	write: ([el, width], prevHeight) => {
		el.style.width = `${width}px`;
		return prevHeight?.();
	},
	read: ([el]) => {
		console.log('final size', el.getBoundingClientRect());
	},
});
```

You can omit any phase you don't need.

## Cleanup

Each phase callback receives an `onCleanup` argument as its last parameter, called before the next run and on destroy.

```ts
const visible = signal(true);

explicitAfterRenderEffect([visible], ([visible], cleanup) => {
	const observer = new ResizeObserver(() => {
		/* ... */
	});
	cleanup(() => observer.disconnect());
});
```
