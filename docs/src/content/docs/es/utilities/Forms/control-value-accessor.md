---
title: NgxControlValueAccessor
description: Una directiva para reducir la redundancia al construir entradas personalizadas.
entryPoint: control-value-accessor
badge: stable
contributor: robby-rabbitman
---

`NgxControlValueAccessor` es una directiva para reducir la redundancia al construir componentes que implementan la interfaz [ControlValueAccessor](https://angular.io/api/forms/ControlValueAccessor).

## Uso

`NgxControlValueAccessor` implementa la interfaz [ControlValueAccessor](https://angular.io/api/forms/ControlValueAccessor) y expone una api _más simple_. Declara `NgxControlValueAccessor` en la sección `hostDirectives` de tu componente e inyecta la instancia para conectar tu plantilla:

- `NgxControlValueAccessor.value` para sincronizar el valor.
- `NgxControlValueAccessor.disabled` para sincronizar el estado deshabilitado.
- `NgxControlValueAccessor.markAsTouched` para marcar la vista como _touched_.

El valor y el estado deshabilitado también están disponibles como señales:

- `NgxControlValueAccessor.value$`
- `NgxControlValueAccessor.disabled$`

### Ejemplo

En este ejemplo, `NgxControlValueAccessor` se utiliza para crear un componente `CustomInput`.

```ts
@Component({
	selector: 'custom-input',
	hostDirectives: [NgxControlValueAccessor],
	template: `
		<label>
			<b>Etiqueta personalizada</b>
			<input
				type="text"
				(input)="cva.value = $event.target.value"
				[value]="cva.value$()"
				[disabled]="cva.disabled$()"
				(blur)="cva.markAsTouched()"
			/>
		</label>
	`,
	standalone: true,
})
export class CustomInput {
	protected cva = inject<NgxControlValueAccessor<string>>(
		NgxControlValueAccessor,
	);
}
```

Con el uso:

```html
<custom-input [formControl]="control" />
<custom-input [(ngModel)]="value" />
```

## Valores no primitivos

Cuando tu modelo es un tipo de dato no primitivo, debes proporcionar un _comparador_. Es una función pura que le dice a `NgxControlValueAccessor` si dos valores son _semánticamente_ iguales:

```ts
(a, b) => boolean;
```

### Ejemplo

En este ejemplo, `NgxControlValueAccessor` se utiliza para crear un selector de `Usuario`. Un `Usuario` se identifica por su `id`.

```ts
interface Usuario {
	id: string;
	nombre: string;
}

const comparadorUsuario: NgxControlValueAccessorCompareTo<Usuario> = (a, b) =>
	a?.id === b?.id;

provideCvaCompareTo(comparadorUsuario, true);

// o

provideCvaCompareToByProp<Usuario>('id');
```

Ejemplo completo:

```ts
@Component({
	selector: 'selector-usuario',
	standalone: true,
	hostDirectives: [NgxControlValueAccessor],
	providers: [provideCvaCompareToByProp<Usuario>('id')],
	template: `
		<label>
			<b>Selecciona un usuario:</b>
			<select
				[disabled]="cva.disabled$()"
				(blur)="cva.markAsTouched()"
				(change)="onChange($event)"
			>
				<option [selected]="cva.value === null">
					-- ningún usuario seleccionado --
				</option>
				@for (usuario of usuarios; track usuario.id) {
					<option
						[value]="usuario.id"
						[selected]="usuario.id === cva.value?.id"
					>
						{{ usuario.nombre }}
					</option>
				}
			</select>
		</label>
	`,
})
export class SelectorUsuario {
	protected cva = inject<NgxControlValueAccessor<Usuario | null>>(
		NgxControlValueAccessor,
	);

	protected onChange = (event: Event) =>
		(this.cva.value =
			this.usuarios.find(({ id }) => event.target.value === id) ?? null);

	@Input()
	usuarios: Usuario[] = [];
}
```

Con uso:

```html
<selector-usuario [formControl]="controlUsuario" [usuarios]="usuarios" />
<selector-usuario [(ngModel)]="usuario" [usuarios]="usuarios" />
```

## Sin `NgControl`

Opcionalmente, puedes exponer `inputs` y `outputs` en la declaración de `hostDirectives` y usarlo sin una directiva `NgControl`.

```ts
hostDirectives: [
	{
		directiva: NgxControlValueAccessor,
		inputs: ['value'],
		outputs: ['valueChange'],
	},
];
```

```html
<custom-input [(value)]="valor" />
```
