---
title: injectNavigationEnd
description: ngxtension/navigation-end
---

The `injectNavigationEnd` function is a utility for creating an `Observable` that emits when a navigation ends. It might perform tasks after a route navigation has been completed.

```ts
import { injectNavigationEnd } from 'ngxtension/navigation-end';
```

## Usage

`injectNavigationEnd` accepts optionally `Injector`.

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
	navigationEnd$ = injectNavigationEnd();
	constructor() {
		navigationEnd$.subscribe((event: NavigationEnd) => {
			// This code will run when a navigation ends.
			console.log('Navigation ended:', event);
		});
	}
}
```
