---
title: injectNavigationEnd
description: Una utilidad de Angular para crear un Observable que emite eventos NavigationEnd del Angular Router.
badge: stable
entryPoint: navigation-end
contributor: mateusz-stefanczyk
---

## Import

```ts
import { injectNavigationEnd } from 'ngxtension/navigation-end';
```

## Uso

### Básico

Crea un Observable que emite cuando una navegación termina en el Router de Angular.

```ts
import { Component } from '@angular/core';
import { injectNavigationEnd } from 'ngxtension/navigation-end';
import { NavigationEnd } from '@angular/router';

@Component({
	standalone: true,
	selector: 'app-example',
	template: '<p>Componente Ejemplo</p>',
})
export class ExampleComponent {
	source$ = injectNavigationEnd();
	constructor() {
		source$.subscribe((event: NavigationEnd) => {
			console.log('Navegación terminada:', event);
		});
	}
}
```

## Uso Fuera de un Contexto de Inyección

La función `injectNavigationEnd` acepta un parámetro `Injector` opcional, lo que permite su uso fuera de un contexto de inyección.

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

- `injector?: Injector` - Opcional. Permite usar la función fuera de un contexto de inyección de Angular.

### Outputs

- Emite un Observable de eventos `NavigationEnd` del Router de Angular.
