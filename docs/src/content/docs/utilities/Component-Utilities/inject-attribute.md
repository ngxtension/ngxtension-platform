---
title: injectAttribute
description: ngxtension/inject-attribute
entryPoint: ngxtension/inject-attribute
badge: stable
contributors: ['SkyZeroZx']
---

`injectAttribute` is a small utility built on top of `HostAttributeToken` that lets you read host attributes through `inject()`.  
It's ideal for **static, initialization-time configuration**, since—unlike `input()` attributes are resolved **once** and never updated later.

```ts
import { injectAttribute } from 'ngxtension/inject-attribute';
```

## Usage

### Basic usage with default value

```ts
@Component({
	selector: 'app-divider',
	standalone: true,
})
class Divider {
	size = injectAttribute('size', 'sm');
}
```

```html
<app-divider size="lg" />
```

If the `size` attribute is not provided, it defaults to `'sm'`.

### Required attributes

Use `injectAttribute.required()` when an attribute must be provided:

```ts
@Component({
	selector: 'app-card',
	standalone: true,
})
class Card {
	variation = injectAttribute.required<string>('variation');
}
```

```html
<app-card variation="primary"></app-card>
```

If the attribute is missing, Angular throws an error: `NG0201: No provider for HostAttributeToken variation found`

### Type coercion with transform

Since host attributes are always strings, use the `transform` option to convert them to other types:

```ts
const numberAttribute = (value: string) => Number(value);
const booleanAttribute = (value: string) => value !== null;

@Component({
	selector: 'app-paginator',
	standalone: true,
})
class Paginator {
	// Convert string to number
	pageSize = injectAttribute('pageSize', 10, {
		transform: numberAttribute,
	});

	// Convert string to boolean
	disabled = injectAttribute('disabled', false, {
		transform: booleanAttribute,
	});
}
```

```html
<app-paginator pageSize="20" disabled />
```
