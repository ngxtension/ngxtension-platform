---
title: injectActiveElement
description: Una utilidad de Angular para crear un Observable que emite el elemento activo del documento.
badge: stable
entryPoint: active-element
contributors: ['nevzat-topçu']
---

## Importa la función

```ts
import { injectActiveElement } from 'ngxtension/active-element';
```

## Uso

### Básico

Crea un Observable que emite cuando el elemento activo -enfocado- cambia.

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

## Uso fuera de un contexto de inyección

La función `injectActiveElement` acepta un parámetro `Injector` opcional, lo que permite su uso fuera de un contexto de inyección.

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

- `injector?: Injector` - Opcional. Permite usar la función fuera de un contexto de inyección de Angular.

### Outputs

- Emite un Observable del HTMLElement activo del documento.
