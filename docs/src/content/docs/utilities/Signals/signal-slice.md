---
title: signalSlice
description: ngxtension/signalSlice
---

`signalSlice` is loosely inspired by the `createSlice` API from Redux Toolkit. The general idea is that it allows you to declaratively create a "slice" of state. This state will be available as a **readonly** signal.

The key motivation, and what makes this declarative, is that all the ways for updating this signal are declared upfront with `sources` and `reducers`. It is not possible to imperatively update the state.

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

One way to update state is through the use of `sources`. These are intended to be used for "auto sources" — as in, observable streams that will emit automatically like an `http.get()`. Although it will work with a `Subject` that you `next` as well, it is recommended that you use a **reducer** for these imperative style state updates.

You can supply a source like this:

```ts
loadChecklists$ = this.checklistsLoaded$.pipe(map((checklists) => ({ checklists, loaded: true })));

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
				}))
			),
	],
});
```

## Reducers and Actions

Another way to update the state is through `reducers` and `actions`. This is good for situations where you need to manually/imperatively trigger some action, and then use the current state in some way in order to calculate the new state.

When you supply a `reducer`, it will automatically create an `action` that you can call. Reducers can be created like this:

```ts
state = signalSlice({
	initialState: this.initialState,
	reducers: {
		add: (state, checklist: AddChecklist) => ({
			checklists: [...state.checklists, checklist],
		}),
		remove: (state, id: RemoveChecklist) => ({
			checklists: state.checklists.filter((checklist) => checklist.id !== id),
		}),
	},
});
```

You can supply a reducer function that has access to the previous state, and whatever payload the action was just called with. Actions are created automatically and can be called like this:

```ts
this.state.add(checklist);
```

It is also possible to have a reducer/action without any payload:

```ts
state = signalSlice({
	initialState: this.initialState,
	reducers: {
		toggleActive: (state) => ({
			active: !state.active,
		}),
	},
});
```

The associated action can then be triggered with:

```ts
this.state.toggleActive();
```

If it also possible to supply an external subject as a reducer like this:

```ts
someAction$ = new Subject<void>();

state = signalSlice({
	initialState: this.initialState,
	reducers: {
		someAction: someAction$,
	},
});
```

This is useful for circumstances where you need any of your `sources` to react
to `someAction$` being triggered. A source can not react to internally created
reducers/actions, but it can react to the externally created subject. Supplying
this subject as a reducer allows you to still trigger it through
`state.someAction()`. This makes using actions more consistent, as everything
can be accessed on the state object, even if you need to create an external
subject.

## Async Reducers

A standard reducer accepts a function that updates the state synchronously. It
is also possible to specify `asyncReducers` that return an observable to update
the state asynchronously.

For example:

```ts
  state = signalSlice({
    initialState: this.initialState,
    asyncReducers: {
      load: (_state, $: Observable<void>) => $.pipe(
        switchMap(() => this.someService.load()),
        map(data => ({ someProperty: data })
      )
    }
  })
```

In this particular case, a `load` action will be created that can be called with `this.state.load()`. When this action is called the internal `Subject` will be nexted, and it is this subject that is being supplied as the `$` parameter above. You can then `pipe` onto that `$` to perform whatever asynchronous operations you need, and then at the end you should `map` the result to whatever parts of the state signal you want to update (just like with standard `reducers`).

**NOTE:** This example covers the use case where data _needs_ to be manually triggered with a `load()` action. It is also possible to just have your data load automatically — in this case the observable that loads the data can just be supplied directly through `sources` and it will be loaded automatically without needing to trigger the `load()` action.

## Action Streams

The source/stream for each action is also exposed on the state object. That means that you can access:

```ts
this.state.add$;
```

Which will allow you to react to the `add` action/reducer being called.

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

It is possible to define signal effects within `signalSlice` itself. This just
uses a standard `effect` behind the scenes, but it provides the benefit of
allowing you to define your effects alongside all your other state concerns
rather than having to have them separately in a `constructor` or field
initialiser:

```ts
state = signalSlice({
	initialState: this.initialState,
	sources: [this.sources$],
	reducers: {
		add: (state, checklist: AddChecklist) => ({
			checklists: [...state.checklists, this.addIdToChecklist(checklist)],
		}),
	},
	effects: (state) => ({
		init: () => {
			console.log('hello');
		},
		saveChecklists: () => {
			// side effect to save checklists
			console.log(state.checklists());
		},
		withCleanup: () => {
			// side effect to save checklists
			console.log(state.checklists());
			return () => {
				console.log('clean up');
			};
		},
	}),
});
```

Make sure that you access the state in effects using your `selectors`:

```ts
state.checklists();
```

**NOT** directly using the state signal:

```ts
state().checklists;
```

If you do, all of your effects will be triggered whenever _anything_ in the state signal updates.

The `effects` are available on the `SignalSlice` as `EffectRef` so you can terminate the effects preemptively if you choose to do so

```ts
state.saveChecklists.destroy();
//      👆 EffectRef
```
