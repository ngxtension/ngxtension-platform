---
title: mergeInputs
description: An input transform that merges a partial object with the input's default value instead of replacing it.
entryPoint: ngxtension/inject-inputs
badge: stable
contributors: ['chau-tran']
---

`mergeInputs` is an input `transform` for object inputs. When a consumer passes a partial object, it is merged with the default value instead of replacing it, so the keys the consumer leaves out keep their defaults.

## Usage

```angular-ts
import { Component, input } from '@angular/core';
import { mergeInputs } from 'ngxtension/inject-inputs';

interface ChartOptions {
	color: string;
	showLegend: boolean;
}

const defaultOptions: ChartOptions = { color: 'blue', showLegend: true };

@Component({
	selector: 'app-chart',
	template: `<p>{{ options().color }} / {{ options().showLegend }}</p>`,
})
export class Chart {
	options = input(defaultOptions, { transform: mergeInputs(defaultOptions) });
}
```

```html
<app-chart [options]="{ color: 'red' }" />
<!-- options() === { color: 'red', showLegend: true } -->
```

Without the transform, `options()` would be `{ color: 'red' }` and `showLegend` would be lost.

## Directives used as a bare attribute

If the input is also the directive selector, writing the attribute without a value (`<div appTooltip>`) passes an empty string. `mergeInputs` returns the default value in that case.

```ts
const defaultTooltip = { position: 'bottom', delay: 0 };

@Directive({ selector: '[appTooltip]' })
export class Tooltip {
	appTooltip = input(defaultTooltip, {
		transform: mergeInputs(defaultTooltip),
	});
}
```

```html
<div appTooltip>...</div>
<!-- appTooltip() === defaultTooltip -->
<div [appTooltip]="{ position: 'top' }">...</div>
<!-- merged with defaultTooltip -->
```

## API

```ts
function mergeInputs<TInputs extends object>(
	defaultValue?: TInputs, // default: {}
): (value: '' | Partial<TInputs>) => TInputs;
```

The merge is shallow (`{ ...defaultValue, ...value }`): nested objects are replaced, not merged.

## Related

- [injectInputs](/utilities/component-utilities/inject-inputs/): read all signal inputs as one object.
