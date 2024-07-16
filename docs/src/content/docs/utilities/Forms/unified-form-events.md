---
title: Unified Form Events
description: .
entryPoint: form-events
badge: stable
contributors: ['michael-small']
---

// TODO about

// TODO article I made about the approach?

## Import

```typescript
import { allEventsObservable, allEventsSignal } from 'ngxtension/form-events';
```

## Usage

`allEventsObservable` and `allEventsSignal` are exposed as an `Observable` and readonly `Signal`
with the following typing.

```ts
type FormEventData<T> = {
	value: T; // So about this... read below as to why this is in effect `Partial<T>`
	status: FormControlStatus;
	touched: boolean;
	pristine: boolean;
	valid: boolean;
	invalid: boolean;
	pending: boolean;
	dirty: boolean;
	untouched: boolean;
};
```

About the value: due to some constraints of reactive forms (TODO: link to issue, TODO: link to `signalSlice` subsection), the value ends up resolving when implemented as `Partial<T>`.

### `allEventsObservable`

TODO example

### `allEventsSignal`

TODO example

## Synergy with `signalSlice`

<!-- TODO - link to it -->
<!-- TODO - link to Josh's video -->
<!-- TODO - mention how it helps type the value as a non Partial -->
<!-- TODO - Show simple example & link more detailed example -->

## Injection Time Resolution
