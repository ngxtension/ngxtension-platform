---
title: filterNil
description: An RxJS operator that drops null and undefined values from a stream and narrows the type, so the rest of the pipe works with non-nullable values.
entryPoint: ngxtension/filter-nil
badge: stable
contributors: ['thomas-laforge']
---

`filterNil` drops `null` and `undefined` from a stream and narrows the type for the operators after it. It reads better than `filter((value) => value != null)` and always narrows the type, whatever your TypeScript version.

```txt
undefined, null, 1, null, 2  ──filterNil()──▶  1, 2
```

## Usage

```angular-ts
import { HttpClient } from '@angular/common/http';
import { Component, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { filterNil } from 'ngxtension/filter-nil';

interface User {
	id: string;
	name: string;
}

@Component({
	selector: 'app-user-profile',
	template: `<h2>{{ user()?.name }}</h2>`,
})
export class UserProfileComponent {
	readonly #http = inject(HttpClient);

	// `undefined` until the parent passes an id
	readonly userId = input<string>();

	readonly user = toSignal(
		toObservable(this.userId).pipe(
			filterNil(), // Observable<string>, not Observable<string | undefined>
			switchMap((id) => this.#http.get<User>(`/api/users/${id}`)),
		),
	);
}
```

It only removes `null` and `undefined`. Falsy values such as `0`, `''` and `false` pass through.

## API

```ts
function filterNil<T>(): OperatorFunction<T, NonNullable<T>>;
```

`filterNil` takes no arguments.

## Related

- `filterUndefined` from [`mapSkipUndefined`](/utilities/rxjs-operators/map-skip-undefined/) drops only `undefined` and keeps `null`.
