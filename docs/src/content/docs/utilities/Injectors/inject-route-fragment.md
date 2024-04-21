---
title: injectRouteFragment
description: ngxtension/inject-route-fragment
entryPoint: inject-route-fragment
contributors: ['krzysztof-kachniarz']
---

`injectRouteFragment` is a helper function that allows you to inject url fragment from the current route as a signal.

```ts
import { injectRouteFragment } from 'ngxtension/inject-route-fragment';
```

## Usage

`injectRouteFragment` when is called, returns a signal with the current route fragment.

```ts
@Component(...)
class TestComponent {
  fragment = injectRouteFragment();
}
```

You can pass transform function or custom injector.

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
