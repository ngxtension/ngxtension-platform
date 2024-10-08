---
title: createRepeat
description: ngxtension/create-repeat
entryPoint: create-repeat
badge: stable
contributors: ['lucas-garcia']
---

## Import

```ts
import { createRepeat } from 'ngxtension/create-repeat';
```

## Usage

Create an RxJS `repeat` operator with an `emit` method on it, to notify when the source should be repeated.

```ts
@Component({
  ...,
  template: `
    ...

    <button (click)="repeat.emit()">Repeat</button>
  `
})
export class SomeComponent {
  readonly repeat = createRepeat();

  // Will log 'hello' directly, then each time the 'Repeat' button gets clicked
  readonly #sayHello = rxEffect(of('hello').pipe(this.repeat()), console.log);
}
```

## API

### `createRepeat` overloads

#### Overload 1

| arguments     | type         | description                                                                                                                                                        |
| ------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `globalCount` | `number`     | Optional. Default is `undefined`.<br>The number of times (applied globally) the source Observable items are repeated (a count of 0 will yield an empty Observable) |
| `destroyRef`  | `DestroyRef` | Optional. Default is `undefined`.<br>The `DestroyRef` to pass when `createRepeat` is used outside of an injection context.                                         |

#### Overload 2

| arguments    | type         | description                                                                                                                |
| ------------ | ------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `destroyRef` | `DestroyRef` | Optional. Default is `undefined`.<br>The `DestroyRef` to pass when `createRepeat` is used outside of an injection context. |

### Returned `repeat` operator

| arguments | type     | description                                                                                                                                     |
| --------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `count`   | `number` | Optional. Default is `undefined`.<br>The number of times the source Observable items are repeated (a count of 0 will yield an empty Observable) |

## See also

- [`rxEffect`](https://ngxtension.netlify.app/utilities/operators/rx-effect)
- RxJS [`repeat`](https://rxjs.dev/api/index/function/repeat)
