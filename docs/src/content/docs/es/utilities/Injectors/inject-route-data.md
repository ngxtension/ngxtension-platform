---
title: injectRouteData
description: ngxtension/inject-route-data
entryPoint: inject-route-data
contributors: ['krzysztof-kachniarz']
---

`injectRouteData` es una función auxiliar que nos permite inyectar datos como una signal, que provienen de la ruta actual.

El tener datos de la ruta como signal nos ayuda en las nuevas arquitecturas angular basadas en signals.

```ts
import { injectRouteData } from 'ngxtension/inject-route-data';
```

## Uso

`injectRouteData` cuando se llama, devuelve una signal con los datos actuales de la ruta.

```ts
@Component({
	standalone: true,
	template: '<div>{{routeData() | json}}</div>',
})
class TestComponent {
	routeData = injectRouteData();
}
```

Si queremos obtener el valor de una propiedad específica, podemos pasar el nomre de la propiedad en el objeto a `injectRouteData`.

```ts
@Component({
	template: `
		<div>{{ details().name }}</div>
		<div>{{ details().description }}</div>
	`,
})
class TestComponent {
	details = injectRouteData('details'); // devuelve una signal con el valor de la propiedad de los datos de la ruta
}
```

O, si necesitamos transformar los datos, podemos pasarle una función a `injectRouteData`.

```ts
@Component()
class TestComponent {
	routeDataKeys = injectRouteData((data) => Object.keys(data)); // devuelve una signal con las propiedades de los datos de la ruta
}
```
