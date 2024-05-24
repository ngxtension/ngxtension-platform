---
title: injectInputs
description: ngxtension/inject-inputs
entryPoint: inject-inputs
badge: stable
contributors: ['chau-tran']
---

`injectInputs` is a utility function that provides a reactive signal for all Signal Inputs in a Directive or Component as an object. This is useful for tracking the state of all Inputs in a component or directive without having to create the `computed` manually.

```ts
import { injectInputs } from 'ngxtension/inject-inputs';
```

## Usage

```ts
@Component({ standalone: true, template: '' })
class Foo {
	foo = input(1);
	bar = input('');

	inputs = injectInputs(this, Foo);

	constructor() {
		console.log(this.inputs()); // { foo: 1, bar: '' }
	}
}
```
