---
title: mergeHttpContext
description: Combine several HttpContext instances into one, so you can compose reusable request flags like caching and logging on a single HttpClient call.
entryPoint: ngxtension/merge-http-context
contributors: ['krzysztof-kachniarz']
---

`mergeHttpContext` combines several `HttpContext` objects into one. `HttpClient` accepts a single `context` per request, so this lets you build small, reusable helpers (`withCache()`, `withLogging()`) and compose them on any call.

## Usage

Write one helper per concern. Each returns its own `HttpContext`:

```ts title="http-context.ts"
import { HttpContext, HttpContextToken } from '@angular/common/http';

export const CACHE = new HttpContextToken<boolean>(() => false);
export const LOG_RESPONSE = new HttpContextToken<boolean>(() => false);

export function withCache(): HttpContext {
	return new HttpContext().set(CACHE, true);
}

export function withLogResponse(): HttpContext {
	return new HttpContext().set(LOG_RESPONSE, true);
}
```

Then merge them on the request:

```ts title="users.service.ts"
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { mergeHttpContext } from 'ngxtension/merge-http-context';
import { withCache, withLogResponse } from './http-context';

@Injectable({ providedIn: 'root' })
export class UsersService {
	readonly #http = inject(HttpClient);

	getUsers() {
		return this.#http.get('/api/users', {
			context: mergeHttpContext(withCache(), withLogResponse()),
		});
	}
}
```

Your interceptors read the tokens as usual:

```ts title="cache.interceptor.ts"
import { HttpInterceptorFn } from '@angular/common/http';
import { CACHE } from './http-context';

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
	if (req.context.get(CACHE)) {
		// serve from cache…
	}
	return next(req);
};
```

## When two contexts set the same token

Contexts are merged from left to right, so the last one wins:

```ts
mergeHttpContext(
	new HttpContext().set(CACHE, true),
	new HttpContext().set(CACHE, false),
).get(CACHE); // false
```

`mergeHttpContext` always returns a new `HttpContext`. The contexts you pass in are not modified. Called with no arguments, it returns an empty context.

## API

```ts
function mergeHttpContext(...contexts: HttpContext[]): HttpContext;
```

| Argument   | Type            | Description                                                            |
| ---------- | --------------- | ---------------------------------------------------------------------- |
| `contexts` | `HttpContext[]` | Contexts to merge. For tokens set more than once, the last value wins. |
