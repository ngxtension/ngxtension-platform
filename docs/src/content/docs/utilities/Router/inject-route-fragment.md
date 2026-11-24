---
title: injectRouteFragment
description: Read the URL fragment (the part after the hash) of the current route as a signal.
entryPoint: ngxtension/inject-route-fragment
contributors: ['krzysztof-kachniarz']
---

`injectRouteFragment` gives you the URL fragment (the part after `#`) of the current route as a signal. It updates whenever the fragment changes, which makes it handy for tabs, in-page sections or highlighting the active anchor.

:::note[Use it inside a routed component]
`injectRouteFragment` reads from the `ActivatedRoute` of the component that calls it. Use it in components that are rendered by a route. In the root component (usually `AppComponent`) the initial value is read before the first navigation.
:::

## Usage

```angular-ts
// URL: /settings#billing
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { injectRouteFragment } from 'ngxtension/inject-route-fragment';

@Component({
	imports: [RouterLink],
	template: `
		<nav>
			<a routerLink="." fragment="profile">Profile</a>
			<a routerLink="." fragment="billing">Billing</a>
		</nav>
		<p>Active section: {{ fragment() ?? 'none' }}</p>
	`,
})
export class Settings {
	fragment = injectRouteFragment(); // Signal<string | null>
}
```

The signal is `null` when the URL has no fragment.

## Default value

Use `defaultValue` for the value to return when there is no fragment.

```ts
// URL: /settings → 'profile'
activeTab = injectRouteFragment({ defaultValue: 'profile' }); // Signal<string>
```

## Parse the fragment

Use `parse` to turn the fragment into another value. It receives `string | null`.

```ts
hasFragment = injectRouteFragment({ parse: (fragment) => !!fragment }); // Signal<boolean>
```

When both are set and the fragment is missing, `defaultValue` is returned and `parse` is skipped.

## Outside an injection context

Pass an `injector` when you call it outside a field initializer or constructor.

```ts
export class Settings implements OnInit {
	private injector = inject(Injector);

	ngOnInit() {
		const fragment = injectRouteFragment({ injector: this.injector });
	}
}
```

## API

```ts
function injectRouteFragment(): Signal<string | null>;
function injectRouteFragment<T>(
	options: InjectRouteFragmentOptions<T>,
): Signal<T>;
```

| Option         | Type                           | Default     | Description                                                              |
| -------------- | ------------------------------ | ----------- | ------------------------------------------------------------------------ |
| `parse`        | `(value: string \| null) => T` | `undefined` | Converts the fragment.                                                   |
| `defaultValue` | `T`                            | `undefined` | Returned when there is no fragment.                                      |
| `injector`     | `Injector`                     | `undefined` | Use it when you call `injectRouteFragment` outside an injection context. |
| `transform`    | `(value: string \| null) => T` | `undefined` | Deprecated: use `parse`.                                                 |

:::caution
With options, the return type is `Signal<T>` even when no `defaultValue` is given, so it doesn't include `null`. Handle the missing fragment in your `parse` function, or pass a `defaultValue`.
:::

## Related

- [injectQueryParams](/utilities/router/inject-query-params/) and [injectParams](/utilities/router/inject-params/) for the other parts of the URL.
