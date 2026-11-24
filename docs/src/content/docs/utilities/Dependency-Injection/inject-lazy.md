---
title: injectLazy
description: Lazy-load a service with a dynamic import and get it as an Observable, to keep it out of the initial bundle.
entryPoint: ngxtension/inject-lazy
badge: stable
contributors: ['enea-jahollari']
---

`injectLazy` loads a service (or any injectable class) with a dynamic `import()` only when you need it, and gives you the instance as an Observable. The service's code, and everything it imports, ends up in a separate chunk instead of your initial bundle. That's useful for heavy services that only some users or some actions need, like a PDF exporter or a charting library wrapper.

:::tip[Background]
Initial idea: [Lazy loading services in Angular. What?! Yes, we can.](https://itnext.io/lazy-loading-services-in-angular-what-yes-we-can-cfbaf586d54e)
Usage and testing: [Lazy loading your services in Angular with tests in mind](https://riegler.fr/blog/2023-09-30-lazy-loading-mockable)
:::

## Usage

```ts title="report-exporter.service.ts"
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ReportExporter {
	exportPdf(data: Report) {
		/* heavy code */
	}
}
```

```angular-ts title="report.component.ts"
import { Component } from '@angular/core';
import { injectLazy } from 'ngxtension/inject-lazy';

@Component({
	selector: 'app-report',
	template: `<button (click)="export()">Export PDF</button>`,
})
export class ReportPage {
	private exporter$ = injectLazy(
		async () => (await import('./report-exporter.service')).ReportExporter,
	);

	report = {} as Report;

	export() {
		this.exporter$.subscribe((exporter) => exporter.exportPdf(this.report));
	}
}
```

Nothing is downloaded until `exporter$` is subscribed to, here on the first click. Calling `injectLazy` alone doesn't load anything.

## Default exports

If the file has a `default` export, return the module directly:

```ts title="report-exporter.service.ts"
@Injectable({ providedIn: 'root' })
export default class ReportExporter {
	/* ... */
}
```

```ts
private exporter$ = injectLazy(() => import('./report-exporter.service'));
```

## Combine with other streams

Because you get an Observable, you can switch to the service's own Observables:

```angular-ts
import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { injectLazy } from 'ngxtension/inject-lazy';
import { switchMap } from 'rxjs';

@Component({
	selector: 'app-stats',
	imports: [AsyncPipe],
	template: '<div>{{ stats$ | async }}</div>',
})
export class Stats {
	private statsService$ = injectLazy(
		async () => (await import('./stats.service')).StatsService,
	);

	stats$ = this.statsService$.pipe(switchMap((service) => service.stats$));
}
```

## Outside an injection context

Pass an `Injector` as the second argument to call it outside a field initializer or constructor:

```ts
export class Stats implements OnInit {
	private injector = inject(Injector);

	ngOnInit() {
		injectLazy(() => import('./stats.service'), this.injector)
			.pipe(switchMap((service) => service.stats$))
			.subscribe((value) => console.log(value));
	}
}
```

:::note[Where the instance lives]
When you call `injectLazy` in a component or directive, the service is created in a new environment injector, a child of the closest environment injector, that is destroyed with the component. Later subscriptions to the same `injectLazy` Observable reuse that instance, but it is not the singleton the rest of the app gets with `inject()`. When you call it in a service (an environment injector), you get the service from that injector as usual.
:::

## Testing

Replace a lazy service with a mock using `mockLazyProvider`. Given this component:

```ts
const MyDataServiceImport = async () =>
	(await import('./my-data.service')).MyDataService;

@Component({ selector: 'app-test', template: '' })
class TestComponent {
	myLazyService$ = injectLazy(MyDataServiceImport);
}
```

Provide the mock in the test:

```ts
import { mockLazyProvider } from 'ngxtension/inject-lazy';
import { MyDataService } from './my-data.service';

class MyDataServiceMock {
	hello = 'world';
}

beforeEach(() => {
	TestBed.configureTestingModule({
		providers: [mockLazyProvider(MyDataService, MyDataServiceMock)],
	});
	fixture = TestBed.createComponent(TestComponent);
});
```

`injectLazy` now emits a `MyDataServiceMock` instance. The mock is created with `new`, not through DI, so it can't use `inject()`.

## API

```ts
function injectLazy<T>(
	loader: () =>
		| Promise<ProviderToken<T>>
		| Promise<{ default: ProviderToken<T> }>,
	injector?: Injector,
): Observable<T>;

function mockLazyProvider<T>(type: Type<T>, mock: Type<unknown>): Provider[];
```

| Parameter  | Type                                       | Description                                                               |
| ---------- | ------------------------------------------ | ------------------------------------------------------------------------- |
| `loader`   | `() => Promise<Type \| { default: Type }>` | A function that dynamically imports the service class.                    |
| `injector` | `Injector`                                 | Optional. Use it when you call `injectLazy` outside an injection context. |

The loader runs each time the Observable is subscribed to. The browser caches the downloaded chunk, so only the first call hits the network.
