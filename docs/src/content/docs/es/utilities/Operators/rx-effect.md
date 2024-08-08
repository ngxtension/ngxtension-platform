---
title: rxEffect
description: ngxtension/rx-effect
entryPoint: rx-effect
badge: stable
contributors: ['lucas-garcia']
---

`rxEffect` es una utilidad que nos ayuda a crear un side effect con rxjs, devolviendo `Subscription` manejada adecuadamente, con `takeUntilDestroyed` en ella.

La lógica del effect puede:

- ser asignada cómo segundo parámetro, cómo si fuera un [`TapObserver`](https://rxjs.dev/api/index/interface/TapObserver) o en la función `next`
- o puede ser directamente manejado en el origen (menos recomendado pero podríamos necesitar hacerlo si nuestro effect necesita estar dentro de un `switchMap` o similar)

| argumentos        | tipo                                                                   | descripción                                                                                                     |
| ----------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `source`          | `Observable<T>`                                                        | cualquier `Observable` al cual se suscribirá para poder ejecutar el side effect                                 |
| `effectOrOptions` | `TapObserver<T> \| ((value: T) => void) \| { destroyRef: DestroyRef }` | Opcional. El valor por defecto es `undefined`.<br>Un next handler, un observer parcial o un objeto options.     |
| `options`         | `{ destroyRef: DestroyRef }`                                           | Opcional. El valor por defecto es `undefined`.<br>Un objeto options para proveer `DestroyRef`, si es necesario. |

```ts
import { rxEffect } from 'ngxtension/rx-effect';
```

## Uso

Con la función `next`

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

	readonly #toggleLastNameAccess = rxEffect(
		this.user.controls.firstName.valueChanges,
		(firstName) => {
			if (firstName) this.user.controls.lastName.enable();
			else this.user.controls.lastName.disable();
		},
	);
}
```

Con `TapObserver`

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

	readonly #toggleLastNameAccess = rxEffect(
		this.user.controls.firstName.valueChanges,
		{
			next: (firstName) => {
				if (firstName) this.user.controls.lastName.enable();
				else this.user.controls.lastName.disable();
			},
		},
	);
}
```

Con el effect gestionado directamente en el origen

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
	readonly #userService = inject(UserService);

	readonly user = new FormGroup({
		firstName: new FormControl(''),
		lastName: new FormControl(''),
	});

	readonly #saveChangesOnTheFly = rxEffect(
		this.user.valueChanges.pipe(
			debounceTime(500),
			switchMap((user) => this.userService.save(user)),
		),
	);
}
```
