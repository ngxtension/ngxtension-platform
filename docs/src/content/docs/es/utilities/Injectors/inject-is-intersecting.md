---
title: injectIsIntersecting
description: ngxtension/inject-is-intersecting
badge: stable
contributor: enea-jahollari
---

`injectIsIntersecting` es una función auxiliar que devuelve un observable que emite cuando el componente/directiva o un elemento dado está siendo intersecado.

Para manejar esto, se utiliza `IntersectionObserver` por debajo. La lógica de intersección se ejecuta fuera de Zone para mejor rendimiento.

```ts
import { injectIsIntersecting } from 'ngxtension/inject-is-intersecting';
```

## Uso

Podemos usarlo para escuchar el componente mismo siendo intersecado.

```ts
@Component({})
export class MyComponent {
	private destroyRef = inject(DestroyRef);

	isIntersecting$ = injectIsIntersecting();

	isInViewport$ = this.isIntersecting$.pipe(
		filter((x) => x.intersectionRatio > 0),
		take(1),
	);

	ngOnInit() {
		this.getData().subscribe();
	}

	getData() {
		// Solo obtiene datos cuando el elemento está en el viewport
		return this.isInViewport$.pipe(
			switchMap(() => this.service.getData()),
			takeUntil(this.destroy$),
		);
	}
}
```

O podemos usarlo para escuchar un elemento dado siendo intersecado.

```ts
@Component({
	template: `
		<div #myDivRef></div>
	`,
})
export class MyComponent implements OnInit {
	@ViewChild('myDivRef', { static: true }) myDivEl!: HTMLDivElement;

	private injector = inject(Injector);

	ngOnInit() {
		const divInViewport$ = injectIsIntersecting({
			element: this.myDivEl,
			injector: this.injector,
		}).pipe(filter((x) => x.intersectionRatio > 0));

		// Solo obtiene datos cuando el elemento está en el viewport
		divInViewport$
			.pipe(
				switchMap(() => this.service.getData()),
				take(1),
			)
			.subscribe();
	}
}
```
