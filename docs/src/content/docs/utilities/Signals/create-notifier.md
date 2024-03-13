---
title: createNotifier
description: ngxtension/create-notifier
entryPoint: create-notifier
badge: experimental
contributors: ['josh-morony']
---

`createNotifier` provides a way to manually trigger signal re-computations by
referencing the created notifier signal. Common use cases for this include:

- Manually triggering a "refresh" and reacting to it
- Mutating a `Map` and having a way to react to that map changing
- Triggering a re-computation on some kind of event/life cycle hook

It simply creates a standard `signal` that has its value incremented by `1`
every time `notify` is called. This means the signal value will change and any
`effect` or `computed` that references this signal will be re-computed.

You can create a notifier like this:

```ts
import { createNotifier } from 'ngxtension/create-notifier';
```

```ts
refreshNotifier = createNotifier();
```

You can trigger the signal update like this:

```ts
refreshNotifier.notify();
```

Then you can trigger a re-computation of any `computed` or `effect` (or
`derivedAsync` from `ngxtension`) by referencing the signal returned on
`listen`:

```ts
effect(() => {
	refreshNotifier.listen();

	// whatever code you want to run whenever
	// refreshNotifier.notify() is called
});
```

An important thing to keep in mind is that an `effect` will also run once
initially before `notify()` is explicitly called. Since the version number used
internally for the signals value begins with `0` you can avoid this "init"
behaviour by setting up your effect like this instead:

```ts
effect(() => {
	if (refreshNotifier.listen()) {
		// Will NOT run on init
		// whatever code you want to run whenever
		// refreshNotifier.notify() is called
	}
});
```

With this set up, the `if` will initially fail because the value of `refreshNotifier.listen()` will initially be `0`, but once `notify` has been explicitly called the `if` condition will always pass because the value of the signal will always be above `0`.
