---
title: injectActiveElement
description: An Angular utility to create an Observable that emits active element from the document.
badge: stable
contributor: Nevzat Topçu
---

## Import

```ts
import { injectActiveElement } from 'ngxtension/active-element';
```

## Usage

### Basic

Create an Observable that emits when the active -focussed- element changes.

```ts
import { Component } from '@angular/core';
import { injectActiveElement } from 'ngxtension/active-element';

@Component({
	standalone: true,
	selector: 'app-example',
	template: `
		<button>btn1</button>
		<button>btn2</button>
		<button>btn3</button>
		<span>{{ (activeElement$ | async)?.innerHTML }}</span>
	`,
})
export class ExampleComponent {
	activeElement$ = injectActiveElement();
}
```

## Use Outside of an Injection Context

The `injectActiveElement` function accepts an optional `Injector` parameter, enabling usage outside of an injection context.

```ts
@Component()
export class ExampleComponent implements OnInit {
	private readonly injector = inject(Injector);

	ngOnInit() {
		const activeElement$ = injectActiveElement(this.injector);
	}
}
```

## API

### Inputs

- `injector?: Injector` - Optional. Allows using the function outside of an Angular injection context.

### Outputs

- Emits an Observable of active HTMLElement from the document.
