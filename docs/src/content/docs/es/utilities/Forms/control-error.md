---
title: NgxControlError
description: Directiva estructural para mostrar errores de control de formulario de manera consistente y reducir el código repetitivo.
badge: stable
contributor: robby-rabbitman
---

`NgxControlError` es una directiva estructural para mostrar errores de control de formulario de manera consistente y reducir el código repetitivo.

## Importar

```typescript
import { NgxControlError } from 'ngxtension/control-error';
```

## Uso

```html
<label>
	<b>Nombre</b>
	<input type="text" [formControl]="name" />
	<strong *ngxControlError="name; track: 'required'">Se requiere el nombre.</strong>
</label>
```

La plantilla se renderizará cuando el control esté en un [_estado de error_](#configuración) y sus errores incluyan el/los error(es) rastreado(s).

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
Un `StateMatcher` es una función que devuelve un observable.
La directiva **SOLO** renderiza la plantilla cuando el `StateMatcher` emite `true`.

```ts
export type StateMatcher = (control: AbstractControl, parent?: FormGroupDirective | NgForm) => Observable<boolean>;
```

Por defecto, el control se considera en un _estado de error_ cuando 1. su estado es `INVALID` y 2. está tocado o su formulario se ha enviado.

Puede anular este comportamiento:

### DI

```ts
provideNgxControlError({ errorStateMatcher: customErrorStateMatcher });
```

### Input

```html
<label>
	<b>Nombre</b>
	<input type="text" [formControl]="name" />
	<strong *ngxControlError="name; track: 'required'; errorStateMatcher: customErrorStateMatcher">Se requiere el nombre.</strong>
</label>
```

## Integración

### [NGX Translate](https://github.com/ngx-translate/core)

Puede iterar sobre todos los posibles errores y pasar los `errors` al tubo de traducción:

```html
<label>
	<b>Correo</b>
	<input type="email" [formControl]="mail" />
	@for (error of ['required', 'email', 'myCustomError']; track error) {
	<strong *ngxControlError="mail; track: error">{{ "RUTA.A.ERRORES.DE.CONTROL.DE.CORREO." + error | translate: mail.errors }}</strong>
	}
</label>
```

### [Angular Material](https://github.com/angular/components)

```html
<mat-form-field>
	<mat-label>Nombre</mat-label>
	<input matInput [formControl]="name" />
	<mat-error *ngxControlError="name; track: 'required'">Se requiere el nombre.</mat-error>
</mat-form-field>
```
