---
title: injectDestroy
description: ngxtension/inject-destroy
badge: stable
contributor: enea-jahollari
---

`injectDestroy` is a helper function that returns an observable that emits when the component is destroyed.

It helps us to avoid memory leaks by unsubscribing from `Observable`s when the component is destroyed.

```ts
import { injectDestroy } from 'ngxtension/inject-destroy';
```

## Usage

If you are familiar with this pattern:

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

You can replace it with `injectDestroy` and remove the boilerplate code:

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

As you can see, we don't need to implement `OnDestroy` anymore and we don't need to manually emit from the `Subject` when the component is destroyed.

### `onDestroy`

The value returned by `injectDestroy()` also includes `onDestroy()` function to register arbitrary destroy logic callbacks.

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
      /* other destroy logics, similar to DestroyRef#onDestroy */
    });
  }
}
```

## How it works

The helper functions injects the `DestroyRef` class from Angular, and on the `onDestroy` lifecycle hook, it emits from the `Subject` and completes it.

```ts
const destroyRef = inject(DestroyRef);
const subject$ = new ReplaySubject<void>(1);

destroyRef.onDestroy(() => {
	subject$.next();
	subject$.complete();
});

return subject$;
```

## Difference with `takeUntilDestroy` from Angular

Angular provides a `takeUntilDestroy` operator that does the same thing. But it requires us to pass the `DestroyRef` to the operator when we are not in an injection context.

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

While `injectDestroy` doesn't require us to pass the `DestroyRef` to the operator.

With `takeUntilDestroyed` we can also initialize the operator and use it later.

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

So, it's up to you to choose which one you prefer to use.
