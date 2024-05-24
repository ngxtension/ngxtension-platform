---
title: injectRouteFragment
description: ngxtension/inject-route-fragment
entryPoint: inject-route-fragment
contributors: ['sergi-dote']
---

`injectRouteFragment` es una función auxiliar que nos permite inyectar el fragmento url de la ruta actual, como signal.

```ts
import { injectRouteFragment } from 'ngxtension/inject-route-fragment';
```

## Uso

`injectRouteFragment` cuando se invoca, devuelve una signal con el fragmento url actual.

```ts
@Component(...)
class TestComponent {
  fragment = injectRouteFragment();
}
```

Podemos pasar una función de transformación o un inyector personalizado.

```ts
@Component()
class TestComponent implements OnInit {
	injector = inject(Injector);

	ngOnInit() {
		const isFragmentAvailable: Signal<boolean> = injectRouteFragment({
			transform: (fragment) => !!fragment,
			injector: this.injector,
		});
	}
}
```
