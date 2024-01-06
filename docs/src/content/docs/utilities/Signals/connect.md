---
title: connect
description: ngxtension/connect
entryPoint: connect
badge: stable
contributor: enea-jahollari
---

`connect` is a utility function that connects a signal to an observable and returns a subscription. The subscription is automatically unsubscribed when the component is destroyed. If it's not called in an injection context, it must be called with an injector or DestroyRef.

```ts
import { connect } from 'ngxtension/connect';
```

## Usage

It can be helpful when you want to have a writable signal, but you want to set its value based on an observable.

For example, you might want to have a signal that represents the current page number, but you want to set its value based on an observable that represents the current page number from a data service.

```ts
@Component()
export class AppComponent implements OnDestroy {
	private dataService = inject(DataService);

	pageNumber = signal(1);

	constructor() {
		connect(this.pageNumber, this.dataService.pageNumber$);
	}
}
```

You can also use it not in an injection context, but you must provide an injector or DestroyRef.

```ts
@Component()
export class AppComponent implements OnDestroy {
	private dataService = inject(DataService);

	private injector = inject(Injector);
	// or
	private destroyRef = inject(DestroyRef);

	pageNumber = signal(1);

	ngOnInit() {
		connect(this.pageNumber, this.dataService.pageNumber$, this.injector);

		// or

		connect(this.pageNumber, this.dataService.pageNumber$, this.destroyRef);
	}
}
```

## Object Signal

There are cases where we construct a single `Signal` to store a state object. `connect` can also work with object signals

```ts
@Component()
export class MyComponent {
	state = signal({
		user: {
			firstName: 'chau',
			lastName: 'tran',
		},
	});

	firstName = computed(() => this.state().user.firstName);
	lastName = computed(() => this.state().user.lastName);

	lastName$ = new Subject<string>();

	constructor() {
		effect(() => {
			console.log('first name changed', this.firstName());
		});

		// we want to connect `lastName$` stream to `state`
		// and when `lastName$` emits, update the state with the `reducer` fn
		connect(this.state, this.lastName$, (prev, lastName) => ({
			user: { ...prev.user, lastName },
		}));

		// logs: first name changed, chau

		// sometimes later
		this.lastName$.next('Tran');

		// `firstName()` effect won't be triggered because we only update `lastName`
	}
}
```

## ConnectedSignal

A `ConnectedSignal` allows you to connect any number of streams to a signal
during or after the initial connect call.

```ts
const connectedSignal = connect(this.state)
	.with(this.lastName$, (prev, lastName) => ({ user: { ...prev.user, lastName } }))
	.with(this.firstName$, (prev, firstName) => ({ user: { ...prev.user, firstName } }));

/* can connect later as well */
connectedSignal.with(/* ... */);

/* can destroy */
connectedSignal.subscription.unsubscribe();

/* after the subscription is closed, connectedSignal doesn't so anything */
connectedSignal.with(/* ...*/)); // won't connect
```

A benefit of this approach is that it allows you to connect multiple streams to
a signal whilst utilising different syntax for the `connect` call.

For example, if your streams directly emit the values you want to set into the
signal, you can use this syntax:

```ts
connect(this.pageNumber, this.dataService.pageNumber$);
```

Or, if you need to use a reducer to access the previous signal value, you can
use this syntax:

```ts
connect(this.state, this.lastName$, (prev, lastName) => ({
	user: { ...prev.user, lastName },
}));
```

However, if you want to use multiple different streams with different reducers,
you would need to use multiple connect calls (one for each reducer you want to
add), e.g:

```ts
connect(this.state, this.someStream$);

connect(this.state, this.add$, (state, checklist) => ({
	checklists: [...state.checklists, checklist],
}));

connect(this.state, this.remove$, (state, id) => ({
	checklists: state.checklists.filter((checklist) => checklist.id !== id),
}));
```

With a `ConnectedSignal` you can use the `with` syntax to chain these into
a single connect call:

```ts
connect(this.state)
	.with(this.someStream$)
	.with(this.lastName$, (prev, lastName) => ({
		user: { ...prev.user, lastName },
	}))
	.with(this.firstName$, (prev, firstName) => ({
		user: { ...prev.user, firstName },
	}));
```

This allows for any combination of streams without reducers and streams with
different types of reducers.
