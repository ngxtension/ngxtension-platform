---
title: injectNavigationEnd
description: An Observable of the router's NavigationEnd events that unsubscribes itself when the component is destroyed.
entryPoint: ngxtension/navigation-end
badge: stable
contributors: ['mateusz-stefanczyk']
---

`injectNavigationEnd` returns an Observable that emits every `NavigationEnd` event of the Angular Router. It saves you the `router.events.pipe(filter(e => e instanceof NavigationEnd))` boilerplate, types the events correctly, and completes when the component (or other injection context) that created it is destroyed, so you don't need to unsubscribe.

## Usage

```angular-ts
import { Component } from '@angular/core';
import { injectNavigationEnd } from 'ngxtension/navigation-end';

@Component({
	selector: 'app-analytics',
	template: '',
})
export class Analytics {
	constructor() {
		injectNavigationEnd().subscribe((event) => {
			// event: NavigationEnd
			console.log('Page view:', event.urlAfterRedirects);
		});
	}
}
```

The subscription ends automatically when `Analytics` is destroyed.

## As a signal

Combine it with `toSignal` to show data from the latest navigation in a template.

```angular-ts
import { Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { injectNavigationEnd } from 'ngxtension/navigation-end';
import { map } from 'rxjs';

@Component({
	selector: 'app-current-url',
	template: `<code>{{ url() }}</code>`,
})
export class CurrentUrl {
	url = toSignal(
		injectNavigationEnd().pipe(map((event) => event.urlAfterRedirects)),
		{ initialValue: '' },
	);
}
```

## Outside an injection context

Pass an `Injector` when you call it outside a field initializer or constructor, for example in `ngOnInit`. The Observable then completes when that injector is destroyed.

```ts
export class Analytics implements OnInit {
	private injector = inject(Injector);

	ngOnInit() {
		injectNavigationEnd(this.injector).subscribe((event) => {
			console.log('Navigation ended:', event.url);
		});
	}
}
```

## API

```ts
function injectNavigationEnd(injector?: Injector): Observable<NavigationEnd>;
```

| Parameter  | Type       | Description                                                                        |
| ---------- | ---------- | ---------------------------------------------------------------------------------- |
| `injector` | `Injector` | Optional. Use it when you call `injectNavigationEnd` outside an injection context. |

The Observable only emits navigations that end after you subscribe; it doesn't replay the last one.

## Related

- [injectLeafActivatedRoute](/utilities/router/inject-leaf-activated-route/): the deepest active route as a signal, updated on every `NavigationEnd`.
