---
title: Queries Migration
description: Schematics for migrating from decorator-based Queries to Signal-based Queries
entryPoint: convert-queries
badge: stable
contributors: ['enea-jahollari']
---

To have a unifying experience with Signals, Angular 17 introduces the Signal-based Queries to replace the Decorator-based ones:

- `@ContentChild` -> `contentChild()`
- `@ContentChildren` -> `contentChildren()`
- `@ViewChild` -> `viewChild()`
- `@ViewChildren` -> `viewChildren()`

### How it works?

The moment you run the schematics, it will look for all the decorators that have queries and convert them to signal queries.

- It will keep the same name for the queries.
- It will keep the same types and default values.
- It will also convert the query references to signal query references.
- It will update the components template to use the new signal queries (by adding `()` to the query references, it may cause some errors when it comes to type narrowing of signal function calls, but that's something that you can fix, by adding `!` to the signal function calls that are inside `@if` blocks).
- It won't convert setter queries.
- It will remove the `@ContentChild`, `@ContentChildren`, `@ViewChild`, and `@ViewChildren` decorators if they are no longer used.

### Example

Before running the schematics:

```typescript
import {
	Component,
	ContentChild,
	ContentChildren,
	ViewChild,
	ViewChildren,
} from '@angular/core';

@Component()
export class AppComponent {
	@ContentChild('my-content-child')
	myContentChild: ElementRef<HTMLImageElement>;
	@ContentChildren('my-content-children') myContentChildren: QueryList<ElementRef<HTMLImageElement>>;
	@ViewChild('my-view-child') myViewChild: ElementRef<HTMLImageElement>;
	@ViewChildren('my-view-children') myViewChildren: QueryList<ElementRef<HTMLImageElement>>;

	@ViewChild('my-input') set myInput(el: ElementRef<HTMLInputElement>) {
		el.nativeElement.focus();
	}
}
```

After running the schematics:

```typescript
import {
	Component,
	contentChild,
	contentChildren,
	viewChild,
	viewChildren,
} from '@angular/core';

@Component()
export class AppComponent {
	myContentChild =
		contentChild<ElementRef<HTMLImageElement>>('my-content-child');
	// ^? Signal<ElementRef<HTMLImageElement>>
	myContentChildren = contentChildren<ElementRef<HTMLImageElement>>(
		'my-content-children',
	);
	// ^? Signal<ReadonlyArray<ElementRef<HTMLImageElement>>>
	myViewChild = viewChild<ElementRef<HTMLImageElement>>('my-view-child');
	// ^? Signal<ElementRef<HTMLImageElement>>
	myViewChildren =
		viewChildren<ElementRef<HTMLImageElement>>('my-view-children');
	// ^? Signal<ReadonlyArray<ElementRef<HTMLImageElement>>>

	// Setter queries are not supported
	@ViewChild('my-input') set myInput(el: ElementRef<HTMLInputElement>) {
		el.nativeElement.focus();
	}
}
```

### Usage

In order to run the schematics for all the project in the app you have to run the following script:

```bash
ng g ngxtension:convert-queries
```

If you want to specify the project name you can pass the `--project` param.

```bash
ng g ngxtension:convert-queries --project=<project-name>
```

If you want to run the schematic for a specific component or directive you can pass the `--path` param.

```bash
ng g ngxtension:convert-queries --path=<path-to-ts-file>
```

### Usage with Nx

To use the schematics on a Nx monorepo you just swap `ng` with `nx`

Example:

```bash
nx g ngxtension:convert-queries --project=<project-name>
```
