---
title: computedAsync
description: ngxtension/computed-async
entryPoint: computed-async
badge: deprecated
contributors: ['enea-jahollari']
---

:::caution[Obsoleto]
`derivedAsync` (antes `computedAsync`) dejará de mantenerse. Para código nuevo, usa las APIs de recursos de Angular: [`resource`](https://angular.dev/guide/signals/resource) para Promises, [`rxResource`](https://angular.dev/api/core/rxjs-interop/rxResource) para Observables y [`httpResource`](https://angular.dev/guide/http/http-resource) para peticiones con `HttpClient`.
:::

`computedAsync` ha sido renombrado a [`derivedAsync`](/utilities/signals/derived-async).

Si quieres migrar tu código, ejecuta el siguiente comando:

```bash
ng update ngxtension@latest
```
