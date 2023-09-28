---
title: injectNavigationEnd
description: An Angular utility to create an Observable that emits NavigationEnd events from the Angular Router.
---

## Import

```ts
import { injectNavigationEnd } from 'ngxtension/navigation-end';
```

## Usage

### Basic

Create an Observable that emits when a navigation ends in Angular's Router.

```ts
import { Component } from '@angular/core';
import { injectNavigationEnd } from 'ngxtension/navigation-end';
import { NavigationEnd } from '@angular/router';

@Component({
	standalone: true,
	selector: 'app-example',
	template: '<p>Example Component</p>',
})
export class ExampleComponent {
	source$ = injectNavigationEnd();
	constructor() {
		source$.subscribe((event: NavigationEnd) => {
			console.log('Navigation ended:', event);
		});
	}
}
```

## Use Outside of an Injection Context

The `injectNavigationEnd` function accepts an optional `Injector` parameter, enabling usage outside of an injection context.

```ts
@Component()
export class ExampleComponent implements OnInit {
	private readonly injector = inject(Injector);

	ngOnInit() {
		source$ = injectNavigationEnd(this.injector);
	}
}
```

## API

### Inputs

- `injector?: Injector` - Optional. Allows using the function outside of an Angular injection context.

### Outputs

- Emits an Observable of `NavigationEnd` events from Angular's Router.
