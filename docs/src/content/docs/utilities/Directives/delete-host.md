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

### Warning

**Important**: Using the `DeleteHostDirective` may interfere with other host directives applied to a component. Since this directive removes the Angular host wrapper around the component after rendering, it might break or alter the behavior of other host directives that rely on the existence of the host element.

It is recommended to test thoroughly if you are using multiple host directives to ensure that applying `DeleteHostDirective` does not cause unintended side effects.