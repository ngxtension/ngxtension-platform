---
title: debug
description: An RxJS operator that logs every value, error and completion of a stream to the console, tagged and timestamped, so you can see what a pipeline is doing.
entryPoint: ngxtension/debug
badge: stable
contributors: ['daniele-morosinotto']
---

`debug` is a `tap` that logs everything passing through a pipeline: each value, the error and the completion, all prefixed with a timestamp and a tag you choose. Drop it between two operators to see what goes in and what comes out, then remove it when you're done.

## Usage

```ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { debug } from 'ngxtension/debug';

interface User {
	id: number;
	name: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
	readonly #http = inject(HttpClient);

	getNames() {
		return this.#http.get<User[]>('/api/users').pipe(
			debug('users'),
			map((users) => users.map((user) => user.name)),
			debug('names'),
		);
	}
}
```

Subscribing to `getNames()` logs:

```txt
2025-01-01T10:00:00.000Z [users: Next] [{ id: 1, name: 'Ada' }, …]
2025-01-01T10:00:00.000Z [names: Next] ['Ada', …]
2025-01-01T10:00:00.001Z [users: Completed]
2025-01-01T10:00:00.001Z [names: Completed]
```

Each event uses a different console method, so you can filter by level in DevTools:

| Event    | Label                | Console method  |
| -------- | -------------------- | --------------- |
| value    | `[tag: Next] value`  | `console.log`   |
| error    | `[tag: Error] error` | `console.error` |
| complete | `[tag: Completed]`   | `console.warn`  |

## Log subscriptions and teardown

Pass a second argument to also log when the stream is subscribed, unsubscribed and finalized. These go to `console.info`. Use it to track down leaks or streams that subscribe more often than you expect.

```ts
source$.pipe(
	debug('search', { subscribe: true, unsubscribe: true, finalize: true }),
);
// [search: Subscribed]
// [search: Next] …
// [search: Unsubscribed]
// [search: Finalized]
```

## API

```ts
function debug<T>(
	tag: string,
	extraNotifications?: ExtraNotifications,
): MonoTypeOperatorFunction<T>;

type ExtraNotifications = {
	subscribe?: boolean;
	unsubscribe?: boolean;
	finalize?: boolean;
};
```

| Option        | Type      | Default | Description                                                                  |
| ------------- | --------- | ------- | ---------------------------------------------------------------------------- |
| `subscribe`   | `boolean` | `false` | Log `[tag: Subscribed]` when the stream is subscribed.                       |
| `unsubscribe` | `boolean` | `false` | Log `[tag: Unsubscribed]` when the subscriber unsubscribes early.            |
| `finalize`    | `boolean` | `false` | Log `[tag: Finalized]` when the stream completes, errors or is unsubscribed. |

`debug` never changes the values that pass through it.
