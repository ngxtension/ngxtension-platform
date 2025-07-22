````markdown
---
title: tapOnce / tapOnceOnFirstTruthy
description: Standalone RxJS operators for executing functions conditionally on emitted values.
entryPoint: ngxtension/tap-once
badge: stable
contributors: ['andreas-dorner']
---

## Import

```typescript
import { tapOnce, tapOnceOnFirstTruthy } from 'ngxtension/tap-once';
```
````

## Usage

### tapOnce

Executes the provided function only once when the value at the specified index is emitted.

```typescript
import { from } from 'rxjs';
import { tapOnce } from 'ngxtension/tap-once';

const in$ = from([1, 2, 3, 4, 5]);
const out$ = in$.pipe(tapOnce((value) => console.log(value), 2));

out$.subscribe(); // logs: 3
```

#### Parameters

- `tapFn`: Function to execute on the value at the specified index.
- `tapIndex`: Index at which to execute the function (default is 0).

### tapOnceOnFirstTruthy

Executes the provided function only once when the first truthy value is emitted.

```typescript
import { from } from 'rxjs';
import { tapOnceOnFirstTruthy } from 'ngxtension/tap-once';

const in$ = from([0, null, false, 3, 4, 5]);
const out$ = in$.pipe(tapOnceOnFirstTruthy((value) => console.log(value)));

out$.subscribe(); // logs: 3
```

#### Parameters

- `tapFn`: Function to execute on the first truthy value.

## API

### tapOnce

- `tapFn: (t: T) => void`
- `tapIndex: number = 0`

### tapOnceOnFirstTruthy

- `tapFn: (t: T) => void`

### Validation

- Throws an error if `tapIndex` is negative.

```

```
