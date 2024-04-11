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
import { Component } from '@angular/core';
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
		private viewContainerRef: ViewContainerRef,
		service2: MyService2,
		@Inject('my-service') private service: MyService,
		@Inject(MyService4) private service4: MyService4,
		@Optional() @Inject('my-service2') private service5: MyService5,
		@Self() @Optional() private service6: MyService6,
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
import { Component } from '@angular/core';
import { MyService } from './my-service';
import { MyService2 } from './my-service2';
import { MyService3 } from './my-service3';
import { MyService4 } from './my-service4';
import { MyService5 } from './my-service5';

@Component()
export class AppComponent {
	private myService = inject(MyService);
	private elRef = inject<ElementRef<HtmlImageElement>>(
		ElementRef<HtmlImageElement>,
	);
	private tplRef = inject<TemplateRef<any>>(TemplateRef<any>);
	private viewContainerRef = inject(ViewContainerRef);
	service2 = inject(MyService2);
	private service = inject<MyService>('my-service');
	private service4 = inject(MyService4);
	private service5 = inject<MyService5>('my-service2', { optional: true });
	private service6 = inject(MyService6, { self: true, optional: true });

	constructor() {
		this.myService.doSomething();

		this.service2.doSomethingElse();

		this.service2.doSomething();

		someList.forEach(() => {
			// nested scope
			this.myService.doSomething();
		});

		// use service in a function call
		someFunction(this.service2).test(this.myService);
	}
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
