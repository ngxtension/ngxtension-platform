---
title: createSingletonProxy
description: ngxtension/singleton-proxy
---

`createSingletonProxy` creates a singleton instance of a given class when a property within it is accessed, not before.

:::tip[Credits]
Credits to [Poimandres](https://pmnd.rs/) for the original code in [R3F Rapier](https://github.com/pmndrs/react-three-rapier)
:::

## Usage

```ts
import { createSingletonProxy } from 'ngxtension/singleton-proxy';

const { proxy: worldProxy, reset: resetWorld } = createSingletonProxy(() => new rapier.World([0, -9.81, 0]));

worldProxy.gravity; // rapier.World() won't be created until this point

resetWorld(); // reset the instance
```
