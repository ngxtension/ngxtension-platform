---
title: rxEffect
description: ngxtension/rx-effect
badge: stable
contributor: lucas-garcia
---

`rxEffect` is a utility function that helps you create a side effect with rxjs, returning an already well handled `Subscription` with `takeUntilDestroyed` within it.

The effect logic can either:

- be set as the second argument as a [`TapObserver`](https://rxjs.dev/api/index/interface/TapObserver) or `next` function
- or be handled directly within the source (less encouraged but you could need to do that if your effect needs to be within a `switchMap` or similar)

| arguments         | type                                                                   | description                                                                                     |
| ----------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `source`          | `Observable<T>`                                                        | Any `Observable` that will be subscribed to, to execute the side effect                         |
| `effectOrOptions` | `TapObserver<T> \| ((value: T) => void) \| { destroyRef: DestroyRef }` | Optional. Default is `undefined`.<br>A next handler, a partial observer or an options object.   |
| `options`         | `{ destroyRef: DestroyRef }`                                           | Optional. Default is `undefined`.<br>An options object there to provide a `DestroyRef` if need. |

```ts
import { rxEffect } from 'ngxtension/rx-effect';
```

## Usage

With the `next` function

```ts
@Component({
	standalone: true,
	imports: [ReactiveFormsModule],
	selector: 'app-root',
	template: `
		<form [formGroup]="user">
			<input type="text" formControlName="firstName" />

			<input type="text" formControlName="lastName" />
		</form>
	`,
})
export class Form {
	readonly user = new FormGroup({
		firstName: new FormControl(''),
		lastName: new FormControl({ value: '', disabled: true }),
	});

	readonly #toggleLastNameAccess = rxEffect(this.user.controls.firstName.valueChanges, (firstName) => {
		if (firstName) this.user.controls.lastName.enable();
		else this.user.controls.lastName.disable();
	});
}
```

With a `TapObserver`

```ts
@Component({
	standalone: true,
	imports: [ReactiveFormsModule],
	selector: 'app-root',
	template: `
		<form [formGroup]="user">
			<input type="text" formControlName="firstName" />

			<input type="text" formControlName="lastName" />
		</form>
	`,
})
export class Form {
	readonly user = new FormGroup({
		firstName: new FormControl(''),
		lastName: new FormControl({ value: '', disabled: true }),
	});

	readonly #toggleLastNameAccess = rxEffect(this.user.controls.firstName.valueChanges, {
		next: (firstName) => {
			if (firstName) this.user.controls.lastName.enable();
			else this.user.controls.lastName.disable();
		},
	});
}
```

With the effect handled directly within the source

```ts
@Component({
	standalone: true,
	imports: [ReactiveFormsModule],
	selector: 'app-root',
	template: `
		<form [formGroup]="user">
			<input type="text" formControlName="firstName" />

			<input type="text" formControlName="lastName" />
		</form>
	`,
})
export class Form {
	readonly #userService = injec(UserService);

	readonly user = new FormGroup({
		firstName: new FormControl(''),
		lastName: new FormControl(''),
	});

	readonly #saveChangesOnTheFly = rxEffect(
		this.user.valueChanges.pipe(
			debounceTime(500),
			switchMap((user) => this.userService.save(user))
		)
	);
}
```
