---
title: injectIsIntersecting
description: ngxtension/inject-is-intersecting
badge: stable
contributor: enea-jahollari
---

`injectIsIntersecting` is a helper function that returns an observable that emits when the component/directive or a given element is being intersected.

To handle this, `IntersectionObserver` is being used underneath. The intersection logic runs outside zone for better performance.

```ts
import { injectIsIntersecting } from 'ngxtension/inject-is-intersecting';
```

## Usage

We can use it to listen to component itself being intersected.

```ts
@Component({})
export class MyComponent {
	private destroyRef = inject(DestroyRef);

	isIntersecting$ = injectIsIntersecting();

	isInViewport$ = this.isIntersecting$.pipe(
		filter((x) => x.intersectionRatio > 0),
		take(1)
	);

	ngOnInit() {
		this.getData().subscribe();
	}

	getData() {
		// Only fetch data when the element is in the viewport
		return this.isInViewport$.pipe(
			switchMap(() => this.service.getData()),
			takeUntil(this.destroy$)
		);
	}
}
```

Or, we can use it to listen to a given element being intersected.

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

		// Only fetch data when the element is in the viewport
		divInViewport$
			.pipe(
				switchMap(() => this.service.getData()),
				take(1)
			)
			.subscribe();
	}
}
```
