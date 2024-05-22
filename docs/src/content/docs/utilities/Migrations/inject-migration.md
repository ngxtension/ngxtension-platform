---
title: inject() Migration
description: Schematics for migrating from constructor dependency injection to inject()
entryPoint: convert-di-to-inject
badge: stable
contributors: ['enea-jahollari', 'kevinkreuzer', 'lilbeqiri']
---

In Angular v14, `inject()` function was introduced as a new way to inject dependencies into Angular components, directives, services, and other classes. This new function is more flexible and provides a better way to inject dependencies compared to the previous way of using constructor dependency injection.

### How it works?

The moment you run the schematics, it will look for all the classes that have dependencies injected in the constructor and convert them to use the `inject()` function.

- It will keep the same order of the dependencies.
- It will keep the same type of the dependencies.
- It will keep the same visibility of the dependencies.
- It will keep the same decorators (converted into options) of the dependencies.
- It will use the correct way of injecting the dependencies when injecting generic types.
- It will skip constructors that have no dependencies.
- It will cleanup empty constructors.
- It will add 'this' keyword to the dependencies that are not using it inside the constructor body.
- It will add the 'inject' import statement to the file if it's not already imported.

### Example:

Before running the schematics:

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
			// nested scope
			myService.doSomething();
		});

		// use service in a function call
		someFunction(service2).test(myService);
	}
}
```

After running the schematics:

```typescript
// will import the `inject` method
import { Component, inject } from '@angular/core';
import { MyService } from './my-service';
import { MyService2 } from './my-service2';
import { MyService3 } from './my-service3';
import { MyService4 } from './my-service4';
import { MyService5 } from './my-service5';

@Component()
export class AppComponent {
	// will keep the private keyword
	private myService = inject(MyService);

	// will pass the Generic type to the inject function as a type argument
	private elRef = inject<ElementRef<HtmlImageElement>>(
		ElementRef<HtmlImageElement>,
	);

	private tplRef = inject<TemplateRef<any>>(TemplateRef<any>);

	// will keep the readonly keyword
	private readonly viewContainerRef = inject(ViewContainerRef);

	// will keep the string token but use 'as any' to avoid type errors
	private service = inject<MyService>(
		'my-service' as any /* TODO(inject-migration): Please check if the type is correct */,
	);

	// will simplify the inject function by passing the class type as a type argument
	private service4 = inject(MyService4);

	// will keep using the string token but use 'as any' to avoid type errors
	private service5 = inject<MyService5>(
		'my-service2' as any /* TODO(inject-migration): Please check if the type is correct */,
		{ optional: true },
	);

	// will keep the decorators and the order
	private service6 = inject(MyService6, { self: true, optional: true });

	// will convert the attribute to a string token using HostAttributeToken
	myAttr = inject<string>(new HostAttributeToken('my-attr'), {
		optional: true,
	});

	constructor() {
		// will inject inside the constructor body when no scope is used
		const service2 = inject(MyService2);

		this.myService.doSomething();

		service2.doSomethingElse();

		service2.doSomething();

		someList.forEach(() => {
			// nested scope
			this.myService.doSomething();
		});

		// use service in a function call
		someFunction(service2).test(this.myService);
	}
}
```

### Options

- `--project`: Specifies the name of the project.
- `--path`: Specifies the path to the file to be migrated.
- `--includeReadonlyByDefault`: Specifies whether to include the readonly keyword by default for the injections. Default is `false`.

#### Include readonly by default

By default, the migration will not add the `readonly` keyword to the injected dependencies. If you want to add the `readonly` keyword to the injected dependencies you can set the `--includeReadonlyByDefault` option to `true`.

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
	// will add the readonly keyword if the option is set to true
	private readonly myService = inject(MyService);
}
```

### Usage

In order to run the schematics for all the project in the app you have to run the following script:

```bash
ng g ngxtension:convert-di-to-inject
```

If you want to specify the project name you can pass the `--project` param.

```bash
ng g ngxtension:convert-di-to-inject --project=<project-name>
```

If you want to run the schematic for a specific component or directive you can pass the `--path` param.

```bash
ng g ngxtension:convert-di-to-inject --path=<path-to-ts-file>
```

### Usage with Nx

To use the schematics on a Nx monorepo you just swap `ng` with `nx`

Example:

```bash
nx g ngxtension:convert-di-to-inject --project=<project-name>
```
