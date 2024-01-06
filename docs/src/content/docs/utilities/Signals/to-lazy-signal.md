---
title: toLazySignal
description: ngxtension/to-lazy-signal
entryPoint: to-lazy-signal
badge: stable
contributor: evgeniy-oz
---

Using `toLazySignal()`, you can save some requests or improve performance.

This function works almost like the original `toSignal()` from Angular core (and uses it), but the subscription will be created not instantly - only when the resulting signal is read for the first time.

It might be helpful if you use resulting signals inside the `@if` or `@switch` branches.

```ts
import { toLazySignal } from 'ngxtension/to-lazy-signal';
```

## Usage

```ts
const additionalList = toLazySignal(this.additionalList$);
```

`toLazySignal()` has the same signature as `toSignal()` - it accepts the same arguments and returns the same result. You can use it as a drop-in replacement.

Same as `toSignal()`, this function should be either called in an injection context (constructor, fields initialization), or an injector should be provided.

Source observable will be unsubscribed on the injector's end of life - in the case of a component, it's the moment when the component is destroyed. In the case of a service without `{providedIn: "root"}` - when the component, which injected this service, is destroyed.

But if a signal was created (using `toSignal()` or `toLazySignal()`) in a service with `{providedIn: "root"}`, or in a root component (usually `AppComponent`), the subscription will never be terminated.  
Sometimes it's exactly what we want, but most of the time it's not.

:::note[Memory Leaks]
As a general rule, it's better to avoid using `toSignal` and `toLazySignal()` in root services and the root component to avoid memory leaks.
:::

But, of course, there are always exceptions, and there are legit cases when a subscription should live as long as the application is alive, and such eternal subscriptions are not memory leaks.
