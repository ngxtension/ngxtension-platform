---
title: injectDestroy
description: ngxtension/inject-destroy
badge: stable
contributor: enea-jahollari
---

`injectDestroy` es una función auxiliar que devuelve un observable que emite cuando el componente se destruye.

Nos ayuda a evitar las fugas de memoria cancelando la suscripción de `Observable`s cuando el componente se destruye.

```ts
import { injectDestroy } from 'ngxtension/inject-destroy';
```

## Uso

Si estás familiarizado con este patrón:

```ts
@Component({})
export class MyComponent implements OnInit, OnDestroy {
  private dataService = inject(DataService);
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.dataService.getData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(...);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

Puedes reemplazarlo con `injectDestroy` y eliminar el código boilerplate:

```ts
@Component({})
export class MyComponent {
  private dataService = inject(DataService);
  private destroy$ = injectDestroy();

  ngOnInit() {
    this.dataService.getData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(...);
  }
}
```

Como puedes ver, ya no necesitamos implementar `OnDestroy` y ya no necesitamos emitir manualmente desde el `Subject` cuando el componente se destruye.

### `onDestroy`

El valor devuelto por `injectDestroy()` también incluye la función `onDestroy()` para registrar callbacks de lógica de destrucción arbitraria.

```ts

@Component({})
export class MyComponent {
  private dataService = inject(DataService);
  private destroy$ = injectDestroy();

  ngOnInit() {
    this.dataService.getData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(...);

    this.destroy$.onDestroy(() => {
      /* otra lógica de destrucción, similar a DestroyRef#onDestroy */
    });
  }
}
```

## Cómo funciona

La función auxiliar inyecta la clase `DestroyRef` de Angular, y en el hook `onDestroy`, emite desde el `Subject` y lo completa.

```ts
const destroyRef = inject(DestroyRef);
const subject$ = new ReplaySubject<void>(1);

destroyRef.onDestroy(() => {
	subject$.next();
	subject$.complete();
});

return subject$;
```

## Diferencia con `takeUntilDestroy` de Angular

Angular provee un operador `takeUntilDestroy` que hace lo mismo. Pero requiere que pasemos el `DestroyRef` al operador cuando no estamos en un contexto de inyección.

```ts
@Component({})
export class MyComponent {
  private dataService = inject(DataService);
  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    this.dataService.getData()
      .pipe(takeUntilDestroy(this.destroyRef))
      .subscribe(...);
  }
}
```

Mientras que `injectDestroy` no requiere que pasemos el `DestroyRef` al operador.

Con `takeUntilDestroyed` también podemos inicializar el operador y usarlo más tarde.

```ts
@Component({})
export class MyComponent {
  private dataService = inject(DataService);
  private takeUntilDestroyed$ = takeUntilDestroyed();

  ngOnInit() {
    this.dataService.getData()
      .pipe(this.takeUntilDestroyed$)
      .subscribe(...);
  }
}
```

Así que depende de ti elegir cuál prefieres usar.
