---
title: injectInputs
description: Get all signal inputs of a component or directive as one computed object.
entryPoint: ngxtension/inject-inputs
badge: stable
contributors: ['chau-tran']
---

`injectInputs` gives you a single signal that holds the current values of all signal inputs (`input()`) of a component or directive, as one object. Use it when you want to react to "any input changed" or pass all inputs along together, without writing the `computed` by hand.

:::caution[Renamed to `inputs`]
`injectInputs` is deprecated. Use `inputs` from the same entry point instead; it has the same signature and behaviour. The examples below use `inputs`.
:::

## Usage

Pass the instance (`this`) and the class itself.

```angular-ts
import { JsonPipe } from '@angular/common';
import { Component, effect, input } from '@angular/core';
import { inputs } from 'ngxtension/inject-inputs';

@Component({
	selector: 'app-chart',
	imports: [JsonPipe],
	template: `<pre>{{ allInputs() | json }}</pre>`,
})
export class Chart {
	type = input<'bar' | 'line'>('bar');
	title = input('');

	allInputs = inputs(this, Chart); // Signal<{ type: 'bar' | 'line'; title: string }>

	constructor() {
		effect(() => console.log(this.allInputs())); // { type: 'bar', title: '' }
	}
}
```

The returned signal is a `computed`, so reading one property of it in another `computed` still re-runs when any input changes.

## API

```ts
function inputs<TDir extends Type<any>>(
	dir: InstanceType<TDir>,
	dirType: TDir,
): Signal<InjectedInputs<InstanceType<TDir>>>;

/** @deprecated use `inputs` */
function injectInputs<TDir extends Type<any>>(
	dir: InstanceType<TDir>,
	dirType: TDir,
): Signal<InjectedInputs<InstanceType<TDir>>>;
```

| Parameter | Type                 | Description                                          |
| --------- | -------------------- | ---------------------------------------------------- |
| `dir`     | `InstanceType<TDir>` | The component or directive instance, usually `this`. |
| `dirType` | `TDir`               | The component or directive class.                    |

`InjectedInputs<T>` maps each `InputSignal<U>` property of the class to `U`. Only signal inputs are included; `@Input()` decorator inputs are skipped. Passing a class that is not a component or directive throws an error.

:::note
Declare the `inputs(...)` field after the inputs it reads, because class fields are initialized in order.
:::

## Related

- [mergeInputs](/utilities/component-utilities/merge-inputs/): merge a partial object input with its default value.
