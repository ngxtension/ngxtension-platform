---
title: rxEffect
description: Subscribes to an observable to run a side effect, and unsubscribes automatically when the component is destroyed.
entryPoint: ngxtension/rx-effect
badge: stable
contributors: ['lucas-garcia']
---

`rxEffect` subscribes to an observable to run a side effect and unsubscribes automatically when the component or service is destroyed (it uses `takeUntilDestroyed` internally). It replaces the `subscribe()` + `takeUntilDestroyed()` boilerplate for things like reacting to form value changes.

## Usage

Pass the source and a function to run for each value:

```angular-ts
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { rxEffect } from 'ngxtension/rx-effect';

@Component({
	selector: 'app-name-form',
	imports: [ReactiveFormsModule],
	template: `
		<form [formGroup]="user">
			<input formControlName="firstName" />
			<input formControlName="lastName" />
		</form>
	`,
})
export class NameForm {
	readonly user = new FormGroup({
		firstName: new FormControl(''),
		lastName: new FormControl({ value: '', disabled: true }),
	});

	// enable lastName only once firstName has a value
	readonly toggleLastName = rxEffect(
		this.user.controls.firstName.valueChanges,
		(firstName) => {
			if (firstName) this.user.controls.lastName.enable();
			else this.user.controls.lastName.disable();
		},
	);
}
```

`rxEffect` returns the `Subscription`. Keep it if you want to unsubscribe early; otherwise you can ignore it.

## Use an observer

Instead of a function, pass a partial [`TapObserver`](https://rxjs.dev/api/index/interface/TapObserver) to also handle `error`, `complete`, `subscribe`, `unsubscribe` or `finalize`:

```ts
readonly toggleLastName = rxEffect(this.user.controls.firstName.valueChanges, {
	next: (firstName) => {
		if (firstName) this.user.controls.lastName.enable();
		else this.user.controls.lastName.disable();
	},
	finalize: () => console.log('stopped listening'),
});
```

## Put the effect in the source

When the side effect is itself asynchronous and needs an operator such as `switchMap`, build it into the source and omit the second argument:

```ts
private readonly userService = inject(UserService);

readonly saveOnTheFly = rxEffect(
	this.user.valueChanges.pipe(
		debounceTime(500),
		switchMap((user) => this.userService.save(user)),
	),
);
```

## Outside an injection context

In an injection context, `rxEffect` uses the current `DestroyRef`. Elsewhere (for example in `ngOnInit`), pass `{ destroyRef }` as the last argument:

```ts
private readonly destroyRef = inject(DestroyRef);

ngOnInit() {
	rxEffect(this.user.valueChanges, (value) => console.log(value), {
		destroyRef: this.destroyRef,
	});
}
```

## API

```ts
function rxEffect<T>(
	source: Observable<T>,
	effect: Partial<TapObserver<T>> | ((value: T) => void),
	options?: { destroyRef: DestroyRef },
): Subscription;

function rxEffect<T>(
	source: Observable<T>,
	options?: { destroyRef: DestroyRef },
): Subscription;
```

| Argument  | Type                                              | Description                                      |
| --------- | ------------------------------------------------- | ------------------------------------------------ |
| `source`  | `Observable<T>`                                   | The observable to subscribe to.                  |
| `effect`  | `Partial<TapObserver<T>> \| ((value: T) => void)` | Optional. Runs for each value (passed to `tap`). |
| `options` | `{ destroyRef: DestroyRef }`                      | Optional. Needed outside an injection context.   |

## Related

- Angular's [`takeUntilDestroyed`](https://angular.dev/api/core/rxjs-interop/takeUntilDestroyed) if you'd rather keep the `subscribe()` call.
- [`createEffect`](/utilities/effects-side-effects/create-effect/) when you want to push values into an effect from several places.
