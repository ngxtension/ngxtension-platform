---
title: createNotifier
description: ngxtension/create-notifier
entryPoint: ngxtension/create-notifier
badge: experimental
contributors: ['josh-morony', 'endlacer']
---

## Features

`createNotifier` provides a way to manually trigger signal re-computations by referencing the created notifier signal. It can also automatically react to changes in other signals through dependency tracking.

### Common Use Cases

- Manually triggering a "refresh" and reacting to it
- Mutating a `Map` and having a way to react to that map changing
- Triggering a re-computation on some kind of event/life cycle hook
- Combining manual notifications with automatic dependency tracking

## Basic Usage

Create a simple notifier:

```ts
import { createNotifier } from 'ngxtension/create-notifier';
refreshNotifier = createNotifier();
```

Trigger the signal update:

```ts
refreshNotifier.notify();
```

React to notifications in `computed` or `effect`:

```ts
effect(() => {
	refreshNotifier.listen();

	// whatever code you want to run whenever
	// refreshNotifier.notify() is called
});
```

### Avoiding Initial Effect Execution

An `effect` runs once initially before `notify()` is explicitly called. Since the internal counter begins at `0`, you can skip the initial run:

```ts
effect(() => {
	if (refreshNotifier.listen()) {
		// Will NOT run on init
		// whatever code you want to run whenever
		// refreshNotifier.notify() is called
	}
});
```

The `if` condition initially fails because `refreshNotifier.listen()` returns `0`, but passes once `notify()` has been called.

## Dependency Tracking

You can configure a notifier to automatically increment whenever specified signals change. This combines manual notifications with reactive dependency tracking.

### Basic Dependency Tracking

```ts
userId = signal(1);

userNotifier = createNotifier({
	deps: [this.userId],
});
```

Now `userNotifier.listen()` will increment both when `notify()` is called **and** when `userId` changes:

```ts
effect(() => {
	console.log('User notifier changed:', userNotifier.listen());
	// Runs when userId changes OR when notify() is called
});

// Both of these will trigger the effect:
userId.set(2); // Triggers via dependency
userNotifier.notify(); // Triggers manually
```

### Multiple Dependencies

Track multiple signals simultaneously:

```ts
userId = signal(1);
tenantId = signal('tenant-a');

compositeNotifier = createNotifier({
	deps: [userId, tenantId],
});
```

The notifier increments whenever **any** of the dependencies change.

### Controlling Initial Emission

By default, notifiers with dependencies start at `1` (emitting immediately). Control this with `depsEmitInitially`:

```ts
// Emit immediately (default behavior)
notifier = createNotifier({
	deps: [someSignal],
	depsEmitInitially: true, // starts at 1 (default)
});

// Don't emit initially
notifier = createNotifier({
	deps: [someSignal],
	depsEmitInitially: false, // starts at 0
});
```

When `depsEmitInitially: false`, the notifier starts at `0` like a dependency-free notifier, even though it tracks signals. The first increment happens only when dependencies change or `notify()` is called.
