---
title: clickOutside
description: An Angular directive that is used to detect clicks outside the element.
badge: stable
contributor: dale-nguyen
---

## Import

```ts
import { ClickOutside } from 'ngxtension/click-outside';
```

## Usage

### Basic

Add `clickOutside` directive directly to the Angular element.

```ts
@Component({
	standalone: true,
	template: `
		<div (clickOutside)="close()"></div>
	`,
	imports: [ClickOutside],
})
class TestComponent {
	close() {
		// close logic
	}
}
```

This will trigger the `close()` method when user clicks outside of the target element.
