---
title: hostBinding
description: ngxtension/host-binding
---

`hostBinding` is a function that returns either a _writable_ or _readonly_ signal and binds the value held in that signal to the host property passed as the first argument like `@HostBinding` would do.

```ts
import { hostBinding } from 'ngxtension/host-binding';
```

## Usage

With `@HostBinding` you can bind a color from a class property:

```ts
@Component({
  standalone: true;
  selector: 'my-component'
  template: '...'
})
export class MyComponent {
  @HostBinding('style.color') color = 'red';

  updateColor(color: 'red' | 'blue') {
    this.color = color;
  }
}
```

With `hostBinding` you can now bind anything like `@HostBinding` on writable or readonly signals:

```ts
@Component({
  standalone: true;
  selector: 'my-component'
  template: '...'
})
export class MyComponent {
  color = hostBinding('style.color', signal('red'));

  updateColor(color: 'red' | 'blue') {
    this.color.set(color);
  }
}
```
