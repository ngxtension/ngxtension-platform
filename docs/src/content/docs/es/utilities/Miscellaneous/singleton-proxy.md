---
title: createSingletonProxy
description: ngxtension/singleton-proxy
badge: stable
entryPoint: singleton-proxy
contributor: chau-tran
---

`createSingletonProxy` crea una instancia singleton de una clase dada cuando se accede a una propiedad dentro de ella, no antes.

:::tip[Créditos]
Crédito a [Poimandres](https://pmnd.rs/) por el código original en [R3F Rapier](https://github.com/pmndrs/react-three-rapier)
:::

## Uso

```ts
import { createSingletonProxy } from 'ngxtension/singleton-proxy';

const { proxy: worldProxy, reset: resetWorld } = createSingletonProxy(
	() => new rapier.World([0, -9.81, 0]),
);

worldProxy.gravity; // rapier.World() será creado hasta que llegue a este punto

resetWorld(); // resetea la instancia
```
