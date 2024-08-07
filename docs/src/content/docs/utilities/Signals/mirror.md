---
title: mirror
description: ngxtension/mirror
entryPoint: mirror
badge: experimental
contributors: ['enea-jahollari']
---

`mirror` is a utility function that mirrors the value of a signal. The mirrored signal is a computed signal that is updated when the given signal is updated.

```ts
import { mirror } from 'ngxtension/mirror';
```

## Usage

It can be helpful when you want to have a writable signal, but you want to set its value based on a signal.

For example, you might want to have a signal that represents the current page number, but you want to set its value based on a signal that represents the current page number from a data service.

```ts
@Component()
export class AppComponent {
	private dataService = inject(DataService);

	pageNumber = signal(1);

	constructor() {
		this.pageNumber.set(this.dataService.pageNumber());
	}
}
```

The `pageNumber` signal won't be updated after the initial set call because we are not listening to the `dataService.pageNumber()` signal changes.
In order to do that we need to listen using an `effect`, where we need to set: `allowSignalWrites` to `true` in the `effect` options.

```ts
@Component()
export class AppComponent {
	private dataService = inject(DataService);

	pageNumber = signal(1);

	constructor() {
		effect(
			() => {
				this.pageNumber.set(this.dataService.pageNumber());
			},
			{ allowSignalWrites: true },
		);
	}
}
```

We can also use `connect` function from `ngxtension/connect` to listen to the `dataService.pageNumber()` signal changes.

```ts
@Component()
export class AppComponent {
	private dataService = inject(DataService);

	pageNumber = signal(1);

	constructor() {
		connect(this.pageNumber, () => this.dataService.pageNumber());
	}
}
```

This is where `mirror` function from `ngxtension/mirror` comes in handy.

```ts
@Component()
export class AppComponent {
	private dataService = inject(DataService);

	pageNumber = mirror(() => this.dataService.pageNumber());
}
```

The `pageNumber` will be a writable signal which is updated when the `dataService.pageNumber()` signal changes.
Basically, it's a writable & computed signal.

It includes a `set` & `update` method that allows you to set the value of the signal.

```ts
@Component()
export class AppComponent implements OnDestroy {
	private dataService = inject(DataService);

	pageNumber = mirror(() => this.dataService.pageNumber());

	onPageChange(currentPage: number) {
		this.pageNumber.set(currentPage); // this will update only the mirrored signal
	}

	nextPage() {
		this.pageNumber.update((prev) => prev + 1);
	}
}
```

To have a better understanding of how `mirror` works, take a look at [mirror.spec.ts](https://github.com/ngxtension/ngxtension-platform/blob/main/libs/ngxtension/mirror/src/mirror.spec.ts) file.
