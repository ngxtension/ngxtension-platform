---
title: connect
description: ngxtension/connect
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

	ngOninit() {
		connect(this.pageNumber, this.dataService.pageNumber$, this.injector);

		// or

		connect(this.pageNumber, this.dataService.pageNumber$, this.destroyRef);
	}
}
```
