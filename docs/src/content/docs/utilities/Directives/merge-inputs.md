---
title: mergeInputs
description: ngxtension/inject-inputs
entryPoint: ngxtension/inject-inputs
badge: stable
contributors: ['chau-tran']
---

When a Component/Directive has an Input with `object` as value, it is common that
the Input has some default object value and can accept a partial of the new value. Normally,
whatever the consumers pass in will be used as-is which the default object value will be overridden
completely.

`mergeInputs` is a simple transform utility that can help merge the new input value with the default object value
so that default value is kept.

```ts
import { mergeInputs } from 'ngxtension/inject-inputs';
```

## Usage

```ts
const defaultOptions = { foo: 'default foo', bar: 123 };

@Component({ standalone: true, template: '' })
class Foo {
	options = input(defaultOptions, { transform: mergeInputs(defaultOptions) });
}
```

```html
<!-- a partial object is passed in -->
<app-foo [options]="{ foo: 'updated foo'}" />
```
