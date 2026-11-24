---
title: hostBinding
description: Bind a signal to a property, attribute, class or style of the host element, like @HostBinding but reactive.
entryPoint: ngxtension/host-binding
badge: stable
contributors: ['lucas-garcia']
---

`hostBinding` binds the value of a signal to a property, attribute, class or style of the host element, the same way `@HostBinding` does. You pass the binding name and a signal (writable or computed), and you get the same signal back. Whenever the signal changes, the host element updates.

## Usage

```angular-ts
import { Component, signal } from '@angular/core';
import { hostBinding } from 'ngxtension/host-binding';

@Component({
	selector: 'app-badge',
	template: `
		<ng-content />
		<button (click)="color.set('blue')">Make it blue</button>
	`,
})
export class Badge {
	color = hostBinding('style.color', signal('red'));
}
```

The host `<app-badge>` gets `style="color: red"`, and `color: blue` after the click. Because `hostBinding` returns the signal you passed in, you keep calling `set()` and `update()` on it as usual.

Compare with the decorator version:

```ts
@Component({ selector: 'app-badge', template: '<ng-content />' })
export class Badge {
	@HostBinding('style.color') color = 'red';
}
```

## Binding types

The first argument uses the same syntax as `@HostBinding`.

### Classes

Use `class.<name>` to toggle one class based on a truthy value, or `class` to set a space-separated list of classes. With `class`, the classes from the previous value are removed before the new ones are added.

```ts
export class Field {
	control = signal({ valid: true });

	isValid = hostBinding(
		'class.valid',
		computed(() => this.control().valid),
	);
	isInvalid = hostBinding(
		'class.invalid',
		computed(() => !this.control().valid),
	);

	// 'hidden something' adds both classes
	classes = hostBinding('class', signal('hidden something'));
}
```

### Styles

Use `style.<property>` for one style. Add a unit as a third segment, like `style.width.px`, and the number is suffixed with it. Use `style` with an object to set several styles at once. CSS custom properties (`style.--my-var`) are supported.

```ts
export class Panel {
	width = hostBinding('style.width.px', signal(500)); // width: 500px
	accent = hostBinding('style.--accent', signal('rebeccapurple'));
	position = hostBinding('style', signal({ position: 'fixed', top: '10px' }));
}
```

### Attributes

Use `attr.<name>` to set an attribute. The value is converted to a string, so `false` renders as `aria-hidden="false"`. Set the signal to `null` or `undefined` to remove the attribute.

```ts
export class Disclosure {
	ariaExpanded = hostBinding('attr.aria-expanded', signal(false));
	ariaHidden = hostBinding('attr.aria-hidden', signal<boolean | null>(null));

	hide() {
		this.ariaHidden.set(true); // aria-hidden="true"
	}

	show() {
		this.ariaHidden.set(null); // attribute removed
	}
}
```

### DOM properties

Any other name is set as a DOM property on the host element.

```ts
export class Item {
	items = signal<string[]>([]);
	id = hostBinding(
		'id',
		computed(() => (this.items().length ? 'filled' : 'empty')),
	);
}
```

## Outside an injection context

`hostBinding` uses `effect()`, `ElementRef` and `Renderer2`, so it needs an injection context. Call it in a field initializer or the constructor, or pass an `Injector` as the third argument.

```ts
export class Item implements OnInit {
	private injector = inject(Injector);

	ngOnInit() {
		hostBinding('attr.data-ready', signal(true), this.injector);
	}
}
```

## API

```ts
function hostBinding<T, S extends Signal<T> | WritableSignal<T>>(
	hostPropertyName: string,
	signal: S,
	injector?: Injector,
): S;
```

| Parameter          | Type                             | Description                                                                                                |
| ------------------ | -------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `hostPropertyName` | `string`                         | `class`, `class.<name>`, `style`, `style.<prop>`, `style.<prop>.<unit>`, `attr.<name>` or a property name. |
| `signal`           | `Signal<T> \| WritableSignal<T>` | The signal whose value is bound. It is returned unchanged.                                                 |
| `injector`         | `Injector`                       | Optional. Use it when you call `hostBinding` outside an injection context.                                 |

## Related

- Angular's [`host` metadata](https://angular.dev/guide/components/host-elements#binding-to-the-host-element) also accepts signal reads, for example `host: { '[style.color]': 'color()' }`. Use it when you prefer bindings in the decorator; use `hostBinding` when you want the binding next to the signal, or inside a reusable function.
