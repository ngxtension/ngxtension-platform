---
title: clickOutside
description: An Angular directive that is used to detect clicks outside the element.
entryPoint: click-outside
badge: stable
contributors: ['dale-nguyen']
---

## Importa la directiva

```ts
import { ClickOutside } from 'ngxtension/click-outside';
```

## Uso

### Básico

Agrega la directiva `clickOutside` al elemento Angular.

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

Esto activará el método `close()` cuando el usuario haga clic fuera del elemento objetivo.
