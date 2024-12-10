---
title: Queries Migration
description: Schematics for migrating from decorator-based Queries to Signal-based Queries
entryPoint: plugin/src/generators/convert-queries
badge: stable
contributors: ['enea-jahollari']
---

Recent releases of Angular have deprecated the `@HostBinding` and `@HostListener` decorators, replacing them with `host` defined properties. This migration schematic will help you convert your existing `@HostBinding` and `@HostListener` decorators to the new `host` properties.

### How it works?

The moment you run the schematics, it will look for all the decorators that have binding and replace them with `host` properties.

- It will keep the same name for the attributes and properties bindings.
- It will update the component's decorators by adding the `host` property if it does not exist or by adding additional properties within it.
- It won't convert properties to signals.
- It will remove the `@HostListener`, `@HostBinding` decorators.

### Example

Before running the schematics:

```typescript
import { Component, HostBinding, HostListener } from '@angular/core';

@Component({
	/* ... */
})
export class CustomSlider {
	@HostBinding('attr.aria-valuenow')
	value: number = 0;

	@HostBinding('tabIndex')
	getTabIndex() {
		return this.disabled ? -1 : 0;
	}

	@HostListener('keydown', ['$event'])
	updateValue(event: KeyboardEvent) {
		/* ... */
	}
}
```

After running the schematics:

```typescript
import { Component } from '@angular/core';

@Component({
	host: {
		'[attr.aria-valuenow]': 'value',
		'[tabIndex]': 'disabled ? -1 : 0',
		'(keydown)': 'updateValue($event)',
	},
})
export class CustomSlider {
	value: number = 0;
	disabled: boolean = false;
	updateValue(event: KeyboardEvent) {
		/* ... */
	}
}
```

### Usage

In order to run the schematics for all the project in the app you have to run the following script:

```bash
ng g ngxtension:convert-host-binding
```

If you want to specify the project name you can pass the `--project` param.

```bash
ng g ngxtension:convert-host-binding --project=<project-name>
```

If you want to run the schematic for a specific component or directive you can pass the `--path` param.

```bash
ng g ngxtension:convert-host-binding --path=<path-to-ts-file>
```

### Usage with Nx

To use the schematics on a Nx monorepo you just swap `ng` with `nx`

Example:

```bash
nx g ngxtension:convert-host-binding --project=<project-name>
```
