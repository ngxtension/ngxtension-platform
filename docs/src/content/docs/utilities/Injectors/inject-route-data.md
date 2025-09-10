---
title: injectRouteData
description: ngxtension/inject-route-data
entryPoint: ngxtension/inject-route-data
contributors: ['krzysztof-kachniarz']
---

:::note[Router outlet is required]
`injectRouteData` works on all components that are inside routing context. Make sure the component you are using `injectRouteData` in, is part of your routes.
For the same reason - `injectRouteData` will not work correctly inside your root component (usually `AppComponent`)
:::

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

Or, if we want to transform the data, we can pass a function to `injectRouteData`.

```ts
@Component()
class TestComponent {
	routeDataKeys = injectRouteData((data) => Object.keys(data)); // returns a signal with the keys of the route data object
}
```

### Specific value

If we want to get the value for a specific key, we can pass the name of the object key to `injectRouteData`.

```ts
@Component({
	template: `
		<div>{{ details().name }}</div>
		<div>{{ details().description }}</div>
	`,
})
class TestComponent {
	details: Signal<unknown> = injectRouteData('details'); // returns a signal with the value of the details key in route data object
}
```

You can also pass a custom injector or `defaultValue`.

```ts
@Component()
class TestComponent implements OnInit {
	injector = inject(Injector);

	detailsWithDefaultValue: Signal<string> = injectRouteData('details', {
		defaultValue: 'abc',
	});

	ngOnInit() {
		const detailsWithCustomInjector: Signal<boolean> = injectRouteData(
			'details',
			{
				injector: this.injector,
			},
		);
	}
}
```
