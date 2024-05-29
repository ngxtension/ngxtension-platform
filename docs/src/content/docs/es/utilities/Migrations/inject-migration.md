---
title: inject() Migration
description: Schematics for migrating from constructor dependency injection to inject()
entryPoint: convert-di-to-inject
badge: stable
contributors: ['enea-jahollari', 'kevinkreuzer', 'lilbeqiri']
---

En Angular v14, la `inject()` función fue introducida como una nueva forma para inyectar dependencias en componentes, directivass, servicios, y otras clases. Esta nueva función es más flexible y provee un mejor mecanismo de inyección de dependencias, comparado con la forma previa de inyección de dependencias en el constructor.

### ¿Cómo funciona?

En el momento que se ejecutan el schematics, éste mirará todas las clases que tienen dependencias inyectadas en el constructor y las convertirá para que usen la función `inject()`.

- Mantiene el mismo orden de las dependencias.
- Mantiene el mismo tipo de las dependencias.
- Mantiene la misma visibilidad de las dependencias.
- Mantiene los mismos decoradores (convertidos en opciones) de las dependencias.
- Usa la manera correcta de inyección de dependencias cuando se inyecten tipos genéricos.
- Se salta los constructores que no tienen dependencias.
- Limpia los constructores vacíos.
- Añade la palabra clave 'this' a las dependencias que no lo están usando dentro del cuerpo del constructor.
- Añade el import para la función 'inject' al fichero, si no se había añadido anteriormente.

### ExampEjemplole:

Antes de ejecutar el schematics:

```typescript
import { Attribute, Component } from '@angular/core';
import { MyService } from './my-service';
import { MyService2 } from './my-service2';
import { MyService3 } from './my-service3';
import { MyService4 } from './my-service4';
import { MyService5 } from './my-service5';

@Component()
export class AppComponent {
	constructor(
		private myService: MyService,
		private elRef: ElementRef<HtmlImageElement>,
		private tplRef: TemplateRef<any>,
		private readonly viewContainerRef: ViewContainerRef,
		service2: MyService2,
		@Inject('my-service') private service: MyService,
		@Inject(MyService4) private service4: MyService4,
		@Optional() @Inject('my-service2') private service5: MyService5,
		@Self() @Optional() private service6: MyService6,
		@Optional() @Attribute('my-attr') private myAttr: string,
	) {
		myService.doSomething();

		this.service2.doSomethingElse();

		service2.doSomething();

		someList.forEach(() => {
			// ámbito interno
			myService.doSomething();
		});

		// usa el servicio en una llamada
		someFunction(service2).test(myService);
	}
}
```

Después de ejecutar el schematics:

```typescript
// Importa la función `inject`
import { Component, inject } from '@angular/core';
import { MyService } from './my-service';
import { MyService2 } from './my-service2';
import { MyService3 } from './my-service3';
import { MyService4 } from './my-service4';
import { MyService5 } from './my-service5';

@Component()
export class AppComponent {
	// mantiene la palabra clave private
	private myService = inject(MyService);

	// pasa el tipo genérico como argumento de la función inject
	private elRef = inject<ElementRef<HtmlImageElement>>(
		ElementRef<HtmlImageElement>,
	);

	private tplRef = inject<TemplateRef<any>>(TemplateRef<any>);

	// mantiene la palabra clave readonly
	private readonly viewContainerRef = inject(ViewContainerRef);

	// mantiene el token string, usando 'as any' para evitar errores
	private service = inject<MyService>(
		'my-service' as any /* TODO(inject-migration): Please check if the type is correct */,
	);

	// simplifica la función inject, pasando el tipo de la clase como argumento
	private service4 = inject(MyService4);

	// mantiene el uso del token string, pero usando 'as any' para evitar errores
	private service5 = inject<MyService5>(
		'my-service2' as any /* TODO(inject-migration): Please check if the type is correct */,
		{ optional: true },
	);

	// mantiene los decoradores en orden
	private service6 = inject(MyService6, { self: true, optional: true });

	// convierte el atributo a token string, usando HostAttributeToken
	myAttr = inject<string>(new HostAttributeToken('my-attr'), {
		optional: true,
	});

	constructor() {
		// Inyectará en el cuerpo del constructor cuando no se usa ningún ámbito
		const service2 = inject(MyService2);

		this.myService.doSomething();

		service2.doSomethingElse();

		service2.doSomething();

		someList.forEach(() => {
			// ámbito interno
			this.myService.doSomething();
		});

		// usa el servicio en una llamada
		someFunction(service2).test(this.myService);
	}
}
```

### Opciones

- `--project`: Especifica el nombre del proyecto.
- `--path`: Especifica el path del fichero que será migrado.
- `--includeReadonlyByDefault`: Especifica si incluir la palabra clave readonly por defecto en las inyecciones. El valor por defecto es `false`.

#### Incluir readonly por defecto

Por defecto la migración no incluirá la palabra clave `readonly` a las dependencias inyectadas. Si se quiere añadir la palabra clave `readonly`, podemos proporcionar `true` al parámetro `--includeReadonlyByDefault`.

```typescript
import { Component } from '@angular/core';
import { MyService } from './my-service';

@Component()
export class AppComponent {
	constructor(private myService: MyService) {}
}
```

```typescript
import { Component } from '@angular/core';
import { MyService } from './my-service';

@Component()
export class AppComponent {
	// Añadirá la palabra clave readonly keyword si la opción recibe true
	private readonly myService = inject(MyService);
}
```

### Uso

Para ejecutar el schematics en todos los proyectos de la aplicación, tienemos que ejecutar el siguiente script:

```bash
ng g ngxtension:convert-di-to-inject
```

Si se precisa especificar el nombre del proyecto, podemos pasar el parámetro `--project`.

```bash
ng g ngxtension:convert-di-to-inject --project=<project-name>
```

Si necesitamos ejecutar el schematic para un componente o directiva específicos, podemos proporcionar el parámetro `--path`.

```bash
ng g ngxtension:convert-di-to-inject --path=<path-to-ts-file>
```

### Uso con Nx

Para usar el schematics con un monorepo Nx, podemos substituir `ng` por `nx`

Ejemplo:

```bash
nx g ngxtension:convert-di-to-inject --project=<project-name>
```
