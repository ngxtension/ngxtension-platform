---
title: lazyService
description: ngxtension/lazy-service
---

`lazyService` is a helper function that allows us to lazily load a service.

Lazy loading services is useful when we want to shrink the bundle size by loading services only when they are needed.

```ts
import { lazyService } from 'ngxtension/lazy-service';
```

:::tip[Inside story of the function]
Read more here: [Lazy loading services in Angular. What?! Yes, we can.](https://itnext.io/lazy-loading-services-in-angular-what-yes-we-can-cfbaf586d54e)
:::

## Usage

`lazyService` accepts a function that returns a `Promise` of the service. The function will be called only when the service is needed.

It can be a normal dynamic import or a default dynamic import from a module.

```ts
const DataServiceImport = () => import('./data-service').then((m) => m.MyService);
// or
const DataServiceImport = () => import('./data-service');
```

Then, we can use `lazyService` to lazily load the service.

```ts data.service.ts
@Injectable({ providedIn: 'root' })
export class MyService {
	data$ = of(1);
}
```

```ts test.component.ts
const DataServiceImport = () => import('./data-service').then((m) => m.MyService);

@Component({
	standalone: true,
	imports: [AsyncPipe],
	template: '<div>{{data$ | async}}</div>',
})
class TestComponent {
	private dataService$ = lazyService(DataServiceImport);

	data$ = this.dataService$.pipe(switchMap((s) => s.data$));
}
```

We can also use `lazyService` not in an injection context, by passing an injector to it.

```ts test.component.ts
const DataServiceImport = () => import('./data-service');

@Component({
	standalone: true,
	template: '<div>{{data}}</div>',
})
class TestComponent implements OnInit {
	private injector = inject(Injector);

	data = 0;

	ngOnInit() {
		lazyService(DataServiceImport, this.injector)
			.pipe(switchMap((s) => s.data$))
			.subscribe((value) => {
				this.data = value;
			});
	}
}
```
