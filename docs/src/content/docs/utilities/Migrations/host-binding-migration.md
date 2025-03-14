---
title: Host Binding Migration
description: Schematics for migrating from decorator-based Host Bindings to the new host properties in Angular
entryPoint: plugin/src/generators/convert-host-binding
badge: stable
contributors: ['pawel-ostromecki']
---

Recent Angular releases recommend using the `host` property instead of the `@HostBinding` and `@HostListener` decorators, as these decorators are retained primarily for backward compatibility. This schematic will assist you in migrating your code to utilize the new `host` property.

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
ng g ngxtension-plugin:convert-host-binding
```

If you want to specify the project name you can pass the `--project` param.

```bash
ng g ngxtension-plugin:convert-host-binding --project=<project-name>
```

If you want to run the schematic for a specific component or directive you can pass the `--path` param.

```bash
ng g ngxtension-plugin:convert-host-binding --path=<path-to-ts-file>
```

### Usage with Nx

To use the schematics on a Nx monorepo you just swap `ng` with `nx`

Example:

```bash
nx g ngxtension-plugin:convert-host-binding --project=<project-name>
```
