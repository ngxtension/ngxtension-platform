---
title: NgxControlError
description: Directiva estructural para mostrar errores de control de formulario de manera consistente y reducir el código repetitivo.
badge: stable
entryPoint: control-error
contributors: ['robby-rabbitman']
---

`NgxControlError` es una directiva estructural para mostrar consistentemente los errores de los controles de formulario, reduciendo al mismo tiempo la redundancia de código.

## Importar

```typescript
import { NgxControlError } from 'ngxtension/control-error';
```

## Uso

```html
<label>
	<b>Nombre</b>
	<input type="text" [formControl]="name" />
	<strong *ngxControlError="name; track: 'required'">
		Se requiere el nombre.
	</strong>
</label>
```

La plantilla se renderizará cuando el control esté en un [_estado de error_](#configuration) y sus errores incluyan el/los error(es) rastreado(s).

Sin `NgxControlError`:

```html
<label>
	<b>Nombre</b>
	<input type="text" [formControl]="name" />
	@if (name.hasError('required') && (name.touched || form.submitted)) {
	<strong>Se requiere el nombre.</strong>
	}
</label>
```

## Configuración

Un `StateMatcher` define cuándo el control proporcionado está en un _estado de error_.
Un `StateMatcher` es una función que devuelve un observable. Cada vez que el `StateMatcher` emite un valor, la directiva verifica si debe renderizar u ocultar su plantilla:
La directiva renderiza su plantilla cuando el `StateMatcher` emite `true` y los errores del control incluyen al menos un error rastreado, de lo contrario, su plantilla estará oculta.

```ts
export type StateMatcher = (
	control: AbstractControl,
	parent?: FormGroupDirective | NgForm,
) => Observable<boolean>;
```

Por defecto, se considera que el control está en un _estado de error_ cuando 1. su estado es `INVALID` y 2. está `touched` o su formulario ha sido `submitted`.

Puedes anular este comportamiento:

```ts
/**
 * Un control está en un estado de error cuando su estado es inválido.
 * Emite siempre que statusChanges emita.
 * Puedes querer agregar más fuentes, como valueChanges.
 */
export const customErrorStateMatcher: StateMatcher = (control) =>
	control.statusChanges.pipe(
		startWith(control.status),
		map((status) => status === 'INVALID'),
	);
```

### DI

```ts
provideNgxControlError({ errorStateMatcher: customErrorStateMatcher });
```

### Input

```html
<label>
	<b>Nombre</b>
	<input type="text" [formControl]="name" />
	<strong
		*ngxControlError="name; track: 'required'; errorStateMatcher: customErrorStateMatcher"
	>
		Se requiere el nombre.
	</strong>
</label>
```

## Integración

### [NGX Translate](https://github.com/ngx-translate/core)

Puedes iterar sobre todos los errores posibles y pasar los `errors` al pipe de traducción:

```html
<label>
	<b>Correo</b>
	<input type="email" [formControl]="mail" />
	@for (error of ['required', 'email', 'myCustomError']; track error) {
	<strong *ngxControlError="mail; track: error">
		{{ "RUTA.A.ERRORES.CONTROL.CORREO." + error | translate: mail.errors }}
	</strong>
	}
</label>
```

### [Angular Material](https://github.com/angular/components)

```html
<mat-form-field>
	<mat-label>Nombre</mat-label>
	<input matInput [formControl]="name" />
	<mat-error *ngxControlError="name; track: 'required'">
		Se requiere el nombre.
	</mat-error>
</mat-form-field>
```
