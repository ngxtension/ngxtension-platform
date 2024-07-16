---
title: deriveLoading
description: ngxtension/derive-loading
entryPoint: derive-loading
badge: stable
contributors: ['michael-berger']
---

## Import

```ts
import { deriveLoading } from 'ngxtension/derive-loading';
```

## Usage

`deriveLoading` is a operator which will derive a boolean flag representing a loading state of the underlying (async) source. This
flag can be used to e.g. show a spinner in the UI. The loading state will be derived in a "non-flickering"-manner:

- if the async operation takes less than a defined `threshold`, nothing else as the initial value (false) will be emitted.
- if the async operation takes longer than the `threshold`, `true` will be emitted and after a defined `loadingTime` `false` is emitted, preventing that the flickering occours
- if the async operation takes longer than `threshold` + `loadingTime`, `false` is emitted immediately after the async process finished

The operator will improve UX and remove the necessity for custom boilerplate code for simple derivation of loading state.

This operator makes only sense to use on async sources. For sync sources the state will not change from `false`.

### Example

```ts

@Component({
  ...,
  template: `
    @if(showSpinner$ | async){
      ...loading...
    } @else {
      <h2>Data</h2>
      // Do something with data$
      {{...}}
    }
  `
})
export class MyComopnent {

  #dataService = inject(DataService);

  data$ = this.#dataService.fetch();
  showSpinner$ = this.data$.pipe(
    deriveLoading()
  )
}

```

## API

#### Overload 1

| arguments | type                   | description                                                 |
| --------- | ---------------------- | ----------------------------------------------------------- |
| `options` | `DeriveLoadingOptions` | Optional. Default is `{threshold: 500, loadingTime: 1000}`. |

## Tips

### Application wide configuration

In order to configure application wide the default `threshold` and `loadingTime` we can unfortunately not leverage Dependency Injection.

However there is an even easier way to achieve what we want: wrapping `deriveLoading` with a custom RxJs-Operator:

```ts
export function myDeriveLoading<T>(
	options?: DeriveLoadingOptions,
): OperatorFunction<T, boolean> {
	return function <T>(source: Observable<T>): Observable<boolean> {
		return source.pipe(
			deriveLoading(options ?? { threshold: 250, loadingTime: 500 }),
		);
	};
}
```
