---
title: injectRouteData
description: ngxtension/inject-route-data
entryPoint: inject-route-data
contributors: ['krzysztof-kachniarz']
---

`injectRouteData` is a helper function that allows us to inject data from the current route as a signal.

Having route data as a signal helps in a modern angular signals based architecture.

```ts
import { injectRouteData } from 'ngxtension/inject-route-data';
```

## Usage

`injectRouteData` when is called, returns a signal with the current route data.

```ts
@Component({
	standalone: true,
	template: '<div>{{routeData() | json}}</div>',
})
class TestComponent {
	routeData = injectRouteData();
}
```

If we want to get the value for a specific key, we can pass the name of the object key to `injectRouteData`.

```ts
@Component({
	template: `
		<div>{{ details().name }}</div>
		<div>{{ details().description }}</div>
	`,
})
class TestComponent {
	details = injectRouteData('details'); // returns a signal with the value of the details key in route data object
}
```

Or, if we want to transform the data, we can pass a function to `injectRouteData`.

```ts
@Component()
class TestComponent {
	routeDataKeys = injectRouteData((data) => Object.keys(data)); // returns a signal with the keys of the route data object
}
```
