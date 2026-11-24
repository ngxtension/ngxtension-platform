---
title: Introduction
description: What ngxtension is, who it's for, how its entry points keep your bundle small, and where to start.
sidebar:
  order: 1
---

`ngxtension` is a utility library for [Angular](https://angular.dev). It collects the small helpers you'd otherwise copy from project to project: signals that read route params, effects with explicit dependencies, host bindings as signals, RxJS operators, form helpers and more. Each one is typed, tested and written for modern Angular: standalone APIs, signals and `inject()`.

```angular-ts
import { Component } from '@angular/core';
import { injectParams } from 'ngxtension/inject-params';

@Component({
	selector: 'app-product-page',
	template: `<h1>Product {{ productId() }}</h1>`,
})
export class ProductPage {
	// A signal that follows the `:id` route param
	readonly productId = injectParams('id');
}
```

## Who it's for

Angular developers who want less boilerplate without adopting a framework on top of Angular. You pick individual utilities and use them next to Angular's own APIs; there's no global setup, no module to import and no base class to extend.

## Entry points and tree-shaking

Each utility lives in its own [secondary entry point](https://angular.dev/tools/libraries/angular-package-format#entrypoints-and-code-splitting), such as `ngxtension/inject-params` or `ngxtension/poll`. You install one package and import from the entry point you need:

```ts
import { injectParams } from 'ngxtension/inject-params';
import { poll } from 'ngxtension/poll';
```

Only the entry points you import end up in your bundle. Some utilities build on others (for example, many use `ngxtension/assert-injector`), and those are included too.

Every utility page shows its import line and, when available, its gzipped size from [bundlejs](https://bundlejs.com/). That size includes the entry point and the other `ngxtension` entry points it depends on, but not Angular or RxJS.

## Status badges

Each utility page carries a status badge:

- **Stable**: the API is settled and ready for production.
- **Experimental**: new, and the API can still change.
- **Deprecated**: still works, but will be removed in a future major release. The page tells you what to use instead.

When Angular ships a built-in that covers the same need, the `ngxtension` version is deprecated and later removed in a major release. That's the goal: `ngxtension` fills gaps until Angular closes them.

## Where to go next

- [Install ngxtension](/getting-started/installation/) and check which version matches your Angular version.
- Browse the utilities by category in the sidebar. Good first stops:
  - [Router](/utilities/router/inject-params/): route params, query params and route data as signals.
  - [Effects & Side Effects](/utilities/effects-side-effects/explicit-effect/): effects with explicit dependencies.
  - [Component Utilities](/utilities/component-utilities/host-binding/): host bindings and attributes as signals.
  - [RxJS Operators](/utilities/rxjs-operators/poll/): polling, loading flags and other small operators.
- Migrating an existing codebase? The [Migrations](/utilities/migrations/host-binding-migration/) generators automate common refactors.

## Contributing

The project was started by [Chau Tran](https://github.com/nartc) and [Enea Jahollari](https://twitter.com/Enea_Jahollari) and is [open source](https://github.com/ngxtension/ngxtension-platform) under the MIT license. Do you add the same helper to every Angular project? It might belong here. [Open an issue](https://github.com/ngxtension/ngxtension-platform/issues/new) with your idea, a bug report or a question. Contributions of all kinds are welcome.
