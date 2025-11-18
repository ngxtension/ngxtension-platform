---
title: injectRouteFragment
description: ngxtension/inject-route-fragment
entryPoint: ngxtension/inject-route-fragment
contributors: ['krzysztof-kachniarz']
---

:::note[Router outlet is required]
`injectRouteFragment` works on all components that are inside routing context. Make sure the component you are using `injectRouteFragment` in, is part of your routes.
For the same reason - `injectRouteFragment` will not work correctly inside your root component (usually `AppComponent`)
:::

`injectRouteFragment` is a helper function that allows you to inject url fragment from the current route as a signal.

```ts
import { injectRouteFragment } from 'ngxtension/inject-route-fragment';
```

## Usage

`injectRouteFragment` when is called, returns a signal with the current route fragment.

```ts
@Component(...)
class TestComponent {
  fragment: Signal<string | null> = injectRouteFragment();
}
```

You can pass a `parse` function, custom injector or `defaultValue`.

```ts
@Component()
class TestComponent implements OnInit {
	injector = inject(Injector);

	fragmentNotNull: Signal<string> = injectRouteFragment({
		defaultValue: 'abc',
	});

	ngOnInit() {
		const isFragmentAvailable: Signal<boolean> = injectRouteFragment({
			parse: (fragment) => !!fragment,
			injector: this.injector,
		});
	}
}
```
