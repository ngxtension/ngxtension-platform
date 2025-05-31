---
title: createEffect
description: ngxtension/create-effect
entryPoint: ngxtension/create-effect
badge: stable
contributors: ['chau-tran', 'evgeniy-oz']
---

`createEffect` is a standalone version of [NgRx ComponentStore Effect](https://ngrx.io/guide/component-store/effect)

:::tip[From ComponentStore documentation]

- Effects isolate side effects from components, allowing for more pure components that select state and trigger updates and/or effects in ComponentStore(s).
- Effects are Observables listening for the inputs and piping them through the "prescription".
- Those inputs can either be values or Observables of values.
- Effects perform tasks, which are synchronous or asynchronous.

:::

In short, `createEffect` creates a callable function that accepts some data (imperative) or some stream of data (declarative), or none at all.

```ts
import { createEffect } from 'ngxtension/create-effect';
```

## Usage

```ts
@Injectable()
export class Store {
  public readonly saveUser = createEffect<User>(_ => _.pipe(
    exhaustMap((user) => this.userService.saveUser(user).pipe(
      catchError(() => {
        console.error('Failed to save user');
        return EMPTY;
      })
    )),
  ));

  public readonly stopTrackingWhileLoading = createEffect<boolean | undefined>(_ => _.pipe(
    tap((loading) => {
      if (loading) {
        this.trackingService.stopTracking();
      } else {
        this.trackingService.startTracking();
      }
    }),
  ));

  public readonly createUser = createEffect<Partial<User>>((_, callbacks) => _.pipe(
    exhaustMap((user) => this.userService.createUser(user).pipe(
      tap((newUser) => callbacks.success(newUser)),
      catchError((e) => {
        callbacks.error(e);
        return EMPTY;
      })
    )),
  ));

  public readonly getUsersFiltered = createEffect<string>(_ => _.pipe(
    switchMap((filter) => this.userService.getUsersFiltered(filter))
  ));
}


@Component({})
export class Some {

  private readonly store = inject(Store);

  protected save() {
    // If the user clicks the button multiple times, the effect 
    // will ignore all calls while saving, because we use `exhaustMap` in the effect.
    this.store.saveUser(this.userForm.value);
    // As you can see, you don’t need to worry about subscribing, unsubscribing, 
    // or even error handling (although it is absolutely possible to handle errors).
  }

  protected create() {
    // Example of callback usage.  
    // Notice that the effect's implementation should call the callbacks,  
    // because only the effect can know when to call them.
    this.store.createUser(this.userForm.value, () => {
      onSuccess: () => this.toast.success('User created!');
      onError: () => this.toast.error('Failed to create user.');
    });
  }

  protected readonly isLoading = signal(false);

  constructor() {
    // You can just pass a `Signal`, an `Observable`, or a `Promise` 
    // to the effect - it will subscribe and unsubscribe automatically.
    this.store.stopTrackingWhileLoading(this.isLoading);
    // Note that we don’t read the signal value here - we pass the signal itself.
  }

  private readonly filter$ = new BehaviorSubject<string>('');

  private readonly usersFiltered$ = this.filter$.pipe(
    distintinctUntilChanged(),
    debounceTime(300),
    // Sometimes you might need to use the effect as an observable to compose 
    // it with other observables. And you can still pass arguments.
    switchMap((filter) => this.store.getUsersFiltered.asObservable(filter)),
  );
  
  protected readonly filteredUsers = toSignal(this.usersFiltered$);

}
```

### Injection Context

`createEffect` accepts an optional `Injector` so we can call `createEffect` outside of an Injection Context.

```ts
@Component({})
export class Some {
	// 1. setup an Input; we know that Input isn't resolved in constructor
	@Input() multiplier = 2;

	// 2. grab the Injector
	private injector = inject(Injector);

	ngOnInit() {
		// 3. create log effect in ngOnInit; where Input is resolved
		const log = createEffect<number>(
			pipe(
				map((value) => value * this.multiplier),
				tap(console.log.bind(console, 'multiply is -->')),
			),
			// 4. pass in the injector
			{ injector: this.injector },
		);

		// 5. start the effect
		log(interval(1000));
	}
}
```

### Resubscribe on errors

By default, `createEffect()` will re-subscribe on errors, using `retry()` operator.  
This behavior can be configured or turned off, using optional second argument:

```ts
@Component({})
export class Example {
	// Will not resubscribe on error
	private loadProducts = createEffect<string>(
		(_) => _.pipe(switchMap((id) => this.api.loadProducts(id))),
		{ retryOnError: false },
	);

	// Will resubscribe on error with a delay, not more than 3 times
	private loadProducts = createEffect<string>(
		(_) => _.pipe(switchMap((id) => this.api.loadProducts(id))),
		{ retryOnError: { count: 3, delay: 500 } },
	);
}
```

Note that when an observable passed to the effect throws, the effect will only re-subscribe to the handler, not to the passed observable. Re-subscribing to an observable that is in an error state might cause endless loops and unexpected behavior. 
This means the effect will remain usable, but it will not endlessly re-subscribe until the passed observable is out of the error state - you will have to call the effect again.

```ts
@Injectable({providedIn: 'root'})
export class Store {

  public readonly loadProducts = createEffect<string>(pipe(
      // This is the effect’s handler.
      // If `getProducts()` throws, the effect will continue working:
      // the next call to `loadProducts()` will still be handled.
      // Without re-subscribing, the effect would unsubscribe from the handler.
      switchMap((id) => this.api.getProducts(id))
  ));
  
  constructor() {
    const id$ = new BehaviorSubject<string>('123');
    this.loadProducts(id$);
    
    id$.error('error');
    // Now the effect will stop watching the `$id` - but 
    // the effect is still usable, you just need to call it again.
  }
}
```
