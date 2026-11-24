---
title: injectAttribute
description: Read a static host attribute with inject(), with a default value and optional type conversion.
entryPoint: ngxtension/inject-attribute
badge: stable
contributors: ['SkyZeroZx']
---

`injectAttribute` reads a static attribute from the host element through `inject()`. It wraps Angular's `HostAttributeToken` and adds a default value and an optional `transform`.

Use it for configuration that is set once in the template, like a size or a variant. Unlike `input()`, the value is read once when the component is created and never updates, so there is no change tracking to pay for.

## Usage

```angular-ts
import { Component } from '@angular/core';
import { injectAttribute } from 'ngxtension/inject-attribute';

@Component({
	selector: 'app-divider',
	template: `<hr [class]="'divider-' + size" />`,
})
export class Divider {
	size = injectAttribute('size', 'sm');
}
```

```html
<app-divider size="lg" />
<!-- size === 'lg' -->

<app-divider />
<!-- size === 'sm' -->
```

:::note
Only static attributes are read. A property binding such as `[size]="mySize"` is not an attribute, so `injectAttribute` falls back to the default value.
:::

## Required attributes

Use `injectAttribute.required()` when the attribute must be present. It has no default value.

```ts
@Component({ selector: 'app-card', template: '<ng-content />' })
export class Card {
	variation = injectAttribute.required<string>('variation');
}
```

```html
<app-card variation="primary" />
```

If the attribute is missing, Angular throws `NG0201: No provider for HostAttributeToken variation found`.

## Convert the value with `transform`

Attribute values are always strings. Pass a `transform` to convert them. Angular's `numberAttribute` and `booleanAttribute` work here.

```ts
import { booleanAttribute, Component, numberAttribute } from '@angular/core';
import { injectAttribute } from 'ngxtension/inject-attribute';

@Component({ selector: 'app-paginator', template: '' })
export class Paginator {
	pageSize = injectAttribute('pageSize', 10, { transform: numberAttribute });
	disabled = injectAttribute('disabled', false, {
		transform: booleanAttribute,
	});
}
```

```html
<app-paginator pageSize="20" disabled />
<!-- pageSize === 20, disabled === true -->
```

The `transform` only runs when the attribute is present. The default value is returned as is.

## API

```ts
function injectAttribute<T>(
	key: string,
	defaultValue: T,
	options?: InjectAttributeOptions<T>,
): T;

namespace injectAttribute {
	function required<T>(key: string, options?: InjectAttributeOptions<T>): T;
}
```

| Option      | Type                   | Default     | Description                                                          |
| ----------- | ---------------------- | ----------- | -------------------------------------------------------------------- |
| `transform` | `(value: string) => T` | `undefined` | Converts the attribute string to another type.                       |
| `injector`  | `Injector`             | `undefined` | Use it when you call `injectAttribute` outside an injection context. |

The return value is a plain value, not a signal.
