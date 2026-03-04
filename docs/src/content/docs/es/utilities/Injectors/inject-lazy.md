---
title: injectLazy
description: ngxtension/inject-lazy
badge: stable
entryPoint: inject-lazy
contributors: ['enea-jahollari']
---

`injectLazy` es una función auxiliar que nos permite lazy-load un servicio o cualquier tipo de proveedor de Angular.

El lazy loading de servicios es útil cuando queremos reducir el tamaño del bundle al cargar servicios solo cuando se necesitan.

```ts
import { injectLazy } from 'ngxtension/inject-lazy';
```

:::tip[Historia interna de la función]
Inspiración de la implementación inicial: [Lazy loading services in Angular. What?! Yes, we can.](https://itnext.io/lazy-loading-services-in-angular-what-yes-we-can-cfbaf586d54e)
Uso avanzado + testing: [Lazy loading your services in Angular with tests in mind](https://riegler.fr/blog/2023-09-30-lazy-loading-mockable)
:::

## Uso

`injectLazy` acepta una función que devuelve una `Promise` del servicio. La función solo se llamará cuando se necesite el servicio.

Puede ser un import dinámico normal o un import dinámico predeterminado de un módulo.

```ts
const DataServiceImport = () =>
	import('./data-service').then((m) => m.MyService);
// o
const DataServiceImport = () => import('./data-service');
```

Luego, podemos usar `injectLazy` para cargar el servicio perezosamente.

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
	imports: [AsyncPipe],
	template: '<div>{{data$ | async}}</div>',
})
class TestComponent {
	private dataService$ = injectLazy(DataServiceImport);

	data$ = this.dataService$.pipe(switchMap((s) => s.data$));
}
```

También podemos usar `injectLazy` fuera de un contexto de inyección, pasándole un injector.

```ts test.component.ts
const DataServiceImport = () => import('./data-service');

@Component({
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

## Pruebas

Para probar el servicio lazy-loaded, podemos simularlos usando `mockLazyProvider`.

### Ejemplo

Probemos el siguiente componente

```ts
const MyDataServiceImport = () =>
	import('./my-data.service.ts').then((x) => x.MyDataService);

@Component({})
class TestComponent {
	myLazyService$ = injectLazy(MyDataServiceImport);
}
```

En nuestro archivo de prueba podemos hacer esto:

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
			// 👇 aquí proporcionamos el servicio simulado
			mockLazyProvider(MyDataService, MyDataServiceMock),
		],
	});
	fixture = TestBed.createComponent(TestComponent);
});
```

Ahora el componente usará la versión simulada del servicio.
