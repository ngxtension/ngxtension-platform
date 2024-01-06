---
title: ifValidator / ifAsyncValidator
descripción: Funciones para cambiar dinámicamente la validación del Formulario Reactivo de Angular.
badge: stable
contributor: tomer
---

## Import

```typescript
import { ifValidator, ifAsyncValidator } from 'ngxtension/if-validator';
```

## Uso

### ifValidator

Usa `ifValidator` para aplicar validación condicional de formularios. Acepta una condición de callback y `ValidatorFn` o `ValidatorFn[]`.

```typescript
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ifValidator } from 'ngxtension/if-validator';

@Component({
	selector: 'my-app',
	imports: [CommonModule, ReactiveFormsModule],
	template: `
		<input [formControl]="form" />
		<div>Is Form Valid: {{ form.valid }}</div>
		<button (click)="changeCondition()">Change Form Condition</button>
	`,
})
export class App {
	public shouldValidate = true;
	public form = new FormControl(
		null,
		ifValidator(
			() => this.shouldValidate,
			[Validators.required, Validators.email],
		),
	);

	public changeCondition() {
		this.shouldValidate = !this.shouldValidate;
		this.form.updateValueAndValidity();
	}
}
```

### ifAsyncValidator

Similar a `ifValidator` pero para validación asíncrona.

## API

### Inputs para ifValidator

- `condition: (control: FormControl) => boolean` - Una función de callback para determinar si los validadores deben aplicarse.
- `validatorFn: ValidatorFn | ValidatorFn[]` - La(s) función(es) de validación a usar.

### Inputs para ifAsyncValidator

- `condition: (control: FormControl) => boolean` - Una función de callback para determinar si los validadores asíncronos deben aplicarse.
- `validatorFn: AsyncValidatorFn | AsyncValidatorFn[]` - La(s) función(es) de validación asíncrona a usar.
