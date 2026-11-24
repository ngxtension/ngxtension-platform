---
title: Host Binding Migration
description: A generator that moves @HostBinding and @HostListener decorators into the host property of your components and directives.
entryPoint: plugin/src/generators/convert-host-binding
badge: stable
contributors: ['pawel-ostromecki']
---

Angular recommends the `host` property of `@Component` and `@Directive` over the `@HostBinding` and `@HostListener` decorators, which remain for backward compatibility. The `convert-host-binding` generator from `ngxtension-plugin` rewrites those decorators into `host` entries for you, across a whole workspace, one project or a single file.

## Usage

Install the plugin if you don't have it yet:

```shell
npm install -D ngxtension-plugin
```

Then run the generator. Without options it converts every project in the workspace:

```shell
ng g ngxtension-plugin:convert-host-binding
```

In an Nx workspace, use `nx` instead of `ng`:

```shell
nx g ngxtension-plugin:convert-host-binding
```

Limit it to one project or one file:

```shell
ng g ngxtension-plugin:convert-host-binding --project=my-app
ng g ngxtension-plugin:convert-host-binding --path=src/app/slider/slider.component.ts
```

Commit or stash your work first, so you can review the changes with `git diff`.

## What it changes

Before:

```ts
import { Component, HostBinding, HostListener } from '@angular/core';

@Component({
	selector: 'app-slider',
	template: '…',
})
export class SliderComponent {
	@HostBinding('attr.aria-valuenow') value = 0;

	@HostBinding('class.disabled')
	get isDisabled() {
		return this.disabled;
	}

	@HostBinding('tabIndex')
	getTabIndex() {
		return this.disabled ? -1 : 0;
	}

	@HostListener('keydown', ['$event'])
	onKeydown(event: KeyboardEvent) {
		/* … */
	}

	disabled = false;
}
```

After:

```ts
import { Component } from '@angular/core';

@Component({
	selector: 'app-slider',
	template: '…',
	host: {
		'[attr.aria-valuenow]': 'value',
		'[class.disabled]': 'isDisabled',
		'[tabIndex]': 'getTabIndex()',
		'(keydown)': 'onKeydown($event)',
	},
})
export class SliderComponent {
	value = 0;

	get isDisabled() {
		return this.disabled;
	}

	getTabIndex() {
		return this.disabled ? -1 : 0;
	}

	onKeydown(event: KeyboardEvent) {
		/* … */
	}

	disabled = false;
}
```

- Properties and getters become bindings to the member name. Methods become a call: `'getTabIndex()'`.
- `@HostListener` arguments are passed through as written, so `['$event.target']` becomes `'onMousedown($event.target)'`. If the method takes no parameters, the call has no arguments.
- Global targets like `'document:keydown.escape'` are kept.
- If the decorator already has a `host` object, the new entries are added to it.
- The decorators and their `HostBinding` / `HostListener` imports are removed.
- Members stay as they are. Nothing is converted to signals.

:::caution
Review the result before you commit:

- If two members bind the same key (for example two `@HostBinding('class.active')`), only the last one is kept.
- The generator doesn't run your formatter, so the `host` object can be oddly indented. Run Prettier (or your formatter) afterwards.
  :::

## Options

| Option      | Type     | Description                                                             |
| ----------- | -------- | ----------------------------------------------------------------------- |
| `--project` | `string` | Only convert files in this project. Aliases: `--name`, `--projectName`. |
| `--path`    | `string` | Only convert this file, relative to the workspace root.                 |

Pass either `--project` or `--path`, not both. With neither, every project in the workspace is converted. Only `.ts` files that contain `@Component` or `@Directive` and use `@HostBinding` or `@HostListener` are touched.

## Related

- [`hostBinding`](/utilities/component-utilities/host-binding/) to bind a host property to a signal you can also write to.
- [SFC components migration](/utilities/migrations/sfc-migration/), the other generator in `ngxtension-plugin`.
