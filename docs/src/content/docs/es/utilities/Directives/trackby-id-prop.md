---
title: TrackById / TrackByProp
descripción: Directivas de Angular que simplifican el uso de trackBy en *ngFor, eliminando la necesidad de métodos personalizados en componentes.
badge: stable
entryPoint: trackby-id-prop
contributor: daniele-morosinotto
---

## Importa las directivas

```ts
import { TrackById, TrackByProp } from 'ngxtension/trackby-id-prop';
```

## Uso

### TrackById

Para objetos que tienen una propiedad `id`, utiliza `TrackById` para iterar de manera eficiente a través de ellos en `*ngFor`.

```ts
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TrackById } from 'ngxtension/trackby-id-prop';

@Component({
	selector: 'my-app',
	imports: [TrackById],
	template: `
		<ul *ngFor="let item of arr; trackById">
			<li>{{ item.name }}</li>
		</ul>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
	public arr = [
		{ id: 1, name: 'foo' },
		{ id: 2, name: 'bar' },
		{ id: 3, name: 'baz' },
	];
}
```

### TrackByProp

Si necesitas especificar una propiedad diferente para el tracking, utiliza `TrackByProp`.

```ts
template: `
	<p *ngFor="let item of arr; trackByProp: 'name'">
		{{ item.name }} @{{ item.id }}
	</p>
`;
```

## API

### Inputs para TrackById

- `ngForOf: NgIterable<T>` - Un iterable que contiene objetos con una propiedad `id`.

### Inputs para TrackByProp

- `ngForOf: NgIterable<T>` - Un iterable de objetos.
- `ngForTrackByProp: keyof T` - El nombre de la propiedad para trackear los objetos (obligatorio).

### Validación

- Para `TrackById`, un error es lanzado si los objetos del iterable no tienen una propiedad `id`.
- Para `TrackByProp`, un error es lanzado si la propiedad especificada no existe en los objetos del iterable.
