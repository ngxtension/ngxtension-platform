---
title: computed/extendedComputed
description: ngxtension/computed
entryPoint: computed
badge: deprecated
contributors: ['chau-tran']
---

`computed` / `extendedComputed` is an extension of Angular's `computed`. The main difference is `extendedComputed` callback is invoked with the previously computed value. This providers better DX for cases where the consumers need conditional computed and the result should have the previously computed value when a condition does not pass.

```ts
import { computed } from 'ngxtension/computed';
// or import { extendedComputed } from 'ngxtension/computed';
```

## Usage

```ts
import { extendedComputed } from 'ngxtension/computed';

const multiplier = signal(2);
const count = signal(1);

const result = extendedComputed<number>((previousValue) => {
	// only compute when multiplier is even
	if (multiplier() % 2 === 0) {
		return count() * multiplier();
	}
	return previousValue;
});

result(); // 2

multiplier.set(3); // odd number
result(); // 2, previous value

multiplier.set(4);
result(); // 4
```
