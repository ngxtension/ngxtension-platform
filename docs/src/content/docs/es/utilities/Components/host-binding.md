---
title: hostBinding
description: ngxtension/host-binding
entryPoint: host-binding
badge: stable
contributor: lucas-garcia
---

`hostBinding` es una función que devuelve una señal _writable_ o _readonly_ y vincula(bind) el valor que contiene esa señal a la propiedad del host que se pasa como primer argumento tal como `@HostBinding` lo haría.

```ts
import { hostBinding } from 'ngxtension/host-binding';
```

## Uso

Con `@HostBinding` se puede vincular(bind) un color desde una propiedad de clase:

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

Con `hostBinding` ahora se puede vincular(bind) cualquier cosa como `@HostBinding` en señales de escritura o solo lectura:

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
