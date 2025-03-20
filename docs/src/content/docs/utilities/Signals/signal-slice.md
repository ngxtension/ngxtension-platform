---
title: signalSlice
description: ngxtension/signal-slice
entryPoint: ngxtension/signal-slice
badge: stable
contributors: ['josh-morony']
---

`signalSlice` is loosely inspired by the `createSlice` API from Redux Toolkit. The general idea is that it allows you to declaratively create a "slice" of state. This state will be available as a **readonly** signal.

The key motivation, and what makes this declarative, is that all the ways for
updating this signal are declared upfront with `sources` and `actionSources`.
It is not possible to imperatively update the state.

## Basic Usage

```ts
import { signalSlice } from 'ngxtension/signal-slice';
```

```ts
  private initialState: ChecklistsState = {
    checklists: [],
    loaded: false,
    error: null,
  };

  state = signalSlice({
    initialState: this.initialState,
  });
```

The returned `state` object will be a standard **readonly** signal, but it will also have properties attached to it that will be discussed below.

You can access the state as you would with a typical signal:

```ts
this.state().loaded;
```

However, by default `computed` selectors will be created for each top-level property in the initial state:

```ts
this.state.loaded();
```

## Sources

One way to update state is through the use of `sources`. These are intended to be used for "auto sources" — as in, observable streams that will emit automatically like an `http.get()`. Although it will work with a `Subject` that you `next` as well, it is recommended that you use an **actionSource** for these imperative style state updates.

You can supply a source like this:

```ts
loadChecklists$ = this.checklistsLoaded$.pipe(
	map((checklists) => ({ checklists, loaded: true })),
);

state = signalSlice({
	initialState: this.initialState,
	sources: [this.loadChecklists$],
});
```

The `source` should be mapped to a partial of the `initialState`. In the example above, when the source emits it will update both the `checklists` and the `loaded` properties in the state signal.

If you need to utilise the current state in a source, instead of supplying the
observable directly as a source you can supply a function that accepts the state
signal and returns the source:

```ts
state = signalSlice({
	initialState: this.initialState,
	sources: [
		this.loadChecklists$,
		(state) =>
			this.newMessage$.pipe(
				map((newMessage) => ({
					messages: [...state().messages, newMessage],
				})),
			),
	],
});
```

:::tip[Lazy Loading]
If you want any sources to be loaded only _after_ the `signalSlice` is accessed, you can use the `lazySources` configuration.
:::

## Action Sources

Another way to update the state is through `actionSources`. An action source creates an **action** that you can call, and it returns a **source** that is used to update the state.

This is good for situations where you need to manually/imperatively trigger some action, and then use the current state in some way in order to calculate the new state.

When you supply an `actionSource`, it will automatically create an `action` that you can call. Action Sources can be created like this:

```ts
state = signalSlice({
	initialState: this.initialState,
	actionSources: {
		add: (state, action$: Observable<AddChecklist>) =>
			action$.pipe(
				map((checklist) => ({
					checklists: [...state().checklists, checklist],
				})),
			),
		remove: (state, action$: Observable<RemoveChecklist>) =>
			action$.pipe(
				map((id) => ({
					checklists: state().checklists.filter(
						(checklist) => checklist.id !== id,
					),
				})),
			),
	},
});
```

Actions are created automatically using whatever name you provide for the
`actionSource` and can be called like this:

```ts
this.state.add(checklist);
```

It is also possible to have an `actionSource` without any payload. For example
sometimes people might want to manually trigger a load:

```ts
  state = signalSlice({
    initialState: this.initialState,
    actionSources: {
      load: (_state, $: Observable<void>) => $.pipe(
        switchMap(() => this.someService.load()),
        map(data => ({ someProperty: data })
      )
    }
  })
```

In this particular case, a `load` action will be created that can be called with
`this.state.load()`.

**NOTE:** This example covers the use case where data _needs_ to be manually
triggered with a `load()` action. It is also possible to just have your data
load automatically — in this case the observable that loads the data can just be
supplied directly through `sources` rather than `actionSources` and it will be
loaded automatically without needing to trigger the `load()` action.

It is also possible to supply an external subject as an `actionSource` like
this:

```ts
someAction$ = new Subject<void>();

state = signalSlice({
	initialState: this.initialState,
	actionSources: {
		someAction: someAction$,
	},
});
```

This is useful for circumstances where you need any of your `sources` to react
to `someAction$` being triggered. A source can not react to internally created
`actionSources`, but it can react to the externally created subject. Supplying
this subject as an `actionSource` allows you to still trigger it through
`state.someAction()`. This makes using actions more consistent, as everything
can be accessed on the state object, even if you need to create an external
subject.

## Action Updates

:::caution Action Updates are currently experimental, the API may be changed or removed entirely. Please feel free to reach out to joshuamorony with feedback or open an issue. :::

Each `actionSource` will have an equivalent `Updated` version signal automatically generated that will be incremented each time the `actionSource` emits or completes, e.g:

```ts
  state = signalSlice({
    initialState: this.initialState,
    actionSources: {
      load: (_state, $: Observable<void>) => $.pipe(
        switchMap(() => this.someService.load()),
        map(data => ({ someProperty: data })
      )
    }
  })

  effect(() => {
    // triggered when `load` emits/completes and on init
    console.log(state.loadUpdated())
  })
```

This signal will return the current version, starting at `0`. If you do not want your `effect` to be triggered on initialisation you can check for the `0` version value, e.g:

```ts
effect(() => {
	if (state.loadUpdated()) {
		// triggered ONLY when `load` emits/completes
		// NOT on init
	}
});
```

## Action Streams

The source/stream for each action is also exposed on the state object. That means that you can access:

```ts
this.state.add$;
```

Which will allow you to react to the `add` action being called via an observable.

## Selectors

By default, all of the top-level properties from the initial state will be exposed as selectors which are `computed` signals on the state object.

It is also possible to create more selectors simply using `computed` and the values of the signal created by `signalSlice`, however, it is awkward to have some selectors available directly on the state object (our default selectors) and others defined outside of the state object.

It is therefore recommended to define all of your selectors using the `selectors` config of `signalSlice`:

```ts
state = signalSlice({
	initialState: this.initialState,
	selectors: (state) => ({
		loadedAndError: () => state().loaded && state().error,
		whatever: () => 'hi',
	}),
});
```

This will also make these additional computed values available on the state object:

```ts
this.state.loadedAndError();
```

## Effects

:::caution
The `effects` property of `signalSlice` has been deprecated and will eventually be removed. Please use standard signal effects outside of the `signalSlice` instead.
:::

To create side effects for state changes, you can use the standard Angular `effect` to react to the state signal or selectors from `signalSlice` changing, e.g:

```ts
const state = signalSlice({
	initialState,
	actionSources: {
		selectVideo,
		generateAudio,
		uploadAudio,
	},
});

effect(() => {
	if (state.status() === 'complete') {
		// do something
	}
});
```

If you intend to trigger another `actionSource` from within your effects, it will be necessary to enable `allowSignalWrites` as triggering an `actionSource` will cause a value to be written to the state signal, e.g:

```ts
effect(
	() => {
		const status = state.status();

		if (state.status() === 'complete') {
			state.uploadAudio();
		}
	},
	{ allowSignalWrites: true },
);
```
