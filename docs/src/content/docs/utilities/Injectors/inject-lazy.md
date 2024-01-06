---
title: injectLazy
description: ngxtension/inject-lazy
entryPoint: inject-lazy
badge: stable
contributor: enea-jahollari
---

`injectLazy` is a helper function that allows us to lazily load a service or any kind of Angular provider.

Lazy loading services is useful when we want to shrink the bundle size by loading services only when they are needed.

```ts
import { injectLazy } from 'ngxtension/inject-lazy';
```

:::tip[Inside story of the function]
Initial implementation inspiration: [Lazy loading services in Angular. What?! Yes, we can.](https://itnext.io/lazy-loading-services-in-angular-what-yes-we-can-cfbaf586d54e)
Enhanced usage + testing: [Lazy loading your services in Angular with tests in mind](https://riegler.fr/blog/2023-09-30-lazy-loading-mockable)
:::

## Usage

`injectLazy` accepts a function that returns a `Promise` of the service. The function will be called only when the service is needed.

It can be a normal dynamic import or a default dynamic import from a module.

```ts
const DataServiceImport = () =>
	import('./data-service').then((m) => m.MyService);
// or
const DataServiceImport = () => import('./data-service');
```

Then, we can use `injectLazy` to lazily load the service.

```ts data.service.ts
@Injectable({ providedIn: 'root' })
export class MyService {
	data$ = of(1);
}
```

```ts test.component.ts
const DataServiceImport = () =>
	import('./data-service').then((m) => m.MyService);

@Component({
	standalone: true,
	imports: [AsyncPipe],
	template: '<div>{{data$ | async}}</div>',
})
class TestComponent {
	private dataService$ = injectLazy(DataServiceImport);

	data$ = this.dataService$.pipe(switchMap((s) => s.data$));
}
```

We can also use `injectLazy` not in an injection context, by passing an injector to it.

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
		injectLazy(DataServiceImport, this.injector) // 👈
			.pipe(switchMap((s) => s.data$))
			.subscribe((value) => {
				this.data = value;
			});
	}
}
```

## Testing

In order to test the lazy injected service we can mock them using `mockLazyProvider`.

### Testing Example

Let's test the below component

```ts
const MyDataServiceImport = () =>
	import('./my-data.service.ts').then((x) => x.MyDataService);

@Component({})
class TestComponent {
	myLazyService$ = injectLazy(MyDataServiceImport);
}
```

In our test file we can do this:

```ts
import { mockLazyProvider } from 'ngxtension/inject-lazy';

@Injectable()
class MyDataServiceMock {
	hello = 'world';
}

beforeEach(async () => {
	TestBed.configureTestingModule({
		providers: [
			// 👇 here we provide mocked service
			mockLazyProvider(MyDataService, MyDataServiceMock),
		],
	});
	fixture = TestBed.createComponent(TestComponent);
});
```

Now the component will use the mocked version of the service.
