---
title: deleteHost
description: An Angular directive that is used to delete host element.
entryPoint: ngxtension/delete-host
badge: stable
contributors: ['hamedfathi']
---

This directive is an answer to this [GitHub Issue](https://github.com/angular/angular/issues/18877). It helps you to delete Angular host wrapper around your component after rendering.


## Import

```ts
import { DeleteHostDirective } from 'ngxtension/delete-host';
```

## Usage

### Basic

Add `DeleteHostDirective` directly to the Angular element as an host directive for applying the changes.

```ts
@Component({
	standalone: true,
	hostDirectives: [DeleteHostDirective],
	imports: [DeleteHostDirective],
})
class TestComponent {
}
```
