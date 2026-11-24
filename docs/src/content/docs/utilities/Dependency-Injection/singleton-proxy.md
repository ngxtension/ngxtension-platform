---
title: createSingletonProxy
description: Create an object lazily, on first property access, and share that single instance through a proxy that you can reset.
entryPoint: ngxtension/singleton-proxy
badge: stable
contributors: ['chau-tran']
---

`createSingletonProxy` gives you a proxy that stands in for an object that doesn't exist yet. The real object is created the first time you read or write a property on the proxy, and every later access goes to that same instance. A `reset()` function drops the instance so the next access creates a fresh one.

Use it for expensive objects (a physics world, a WebGL context, a third-party SDK client) that you want to reference at module level or pass around, without paying for them until they're used.

:::tip[Credits]
Credits to [Poimandres](https://pmnd.rs/) for the original code in [R3F Rapier](https://github.com/pmndrs/react-three-rapier).
:::

## Usage

```ts
import { createSingletonProxy } from 'ngxtension/singleton-proxy';

const { proxy: world, reset: resetWorld } = createSingletonProxy<rapier.World>(
	() => new rapier.World({ x: 0, y: -9.81, z: 0 }),
);

// No World has been created yet

world.gravity; // the World is created here
world.step(); // same instance

resetWorld(); // drop the instance
world.step(); // a new World is created
```

:::note[Pass the type]
Pass the instance type as a generic, as above. TypeScript can't infer it from the factory, so without it the proxy is typed as `object`.
:::

## Use it in a service

Wrap the proxy in a service to share one lazily created instance across the app:

```ts
import { Injectable, OnDestroy } from '@angular/core';
import { createSingletonProxy } from 'ngxtension/singleton-proxy';

@Injectable({ providedIn: 'root' })
export class AnalyticsClient implements OnDestroy {
	private singleton = createSingletonProxy<HeavyAnalyticsSdk>(
		() => new HeavyAnalyticsSdk({ key: 'my-key' }),
	);

	readonly sdk = this.singleton.proxy;

	ngOnDestroy() {
		this.singleton.reset();
	}
}
```

Injecting `AnalyticsClient` doesn't create the SDK; the first call like `analytics.sdk.track('page_view')` does.

## API

```ts
function createSingletonProxy<T extends object>(
	createInstance: () => T,
): { proxy: T; reset: () => void };
// call it as createSingletonProxy<MyClass>(() => new MyClass())
```

| Name             | Type         | Description                                                                                  |
| ---------------- | ------------ | -------------------------------------------------------------------------------------------- |
| `createInstance` | `() => T`    | Creates the instance. Called on the first property read or write, and again after `reset()`. |
| `proxy`          | `T`          | Forwards property reads and writes to the current instance.                                  |
| `reset`          | `() => void` | Forgets the current instance. It doesn't dispose it; clean it up yourself if needed.         |

:::note
Only property reads (`get`) and writes (`set`) are forwarded. Checks like `'key' in proxy`, `Object.keys(proxy)` or `instanceof` run against the empty proxy target, not the real instance.
Methods run with `this` set to the proxy, so classes that use `#private` fields throw when you call their methods through it.
:::
