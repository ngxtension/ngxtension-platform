---
title: mergeHttpContext
description: ngxtension/merge-http-context
entryPoint: merge-http-context
contributors: ['krzysztof-kachniarz']
---

`mergeHttpContext` is a utility function that combines multiple `HttpContext` instances into a single context, preserving the most recent values for each token.

## Usage

```ts
import { mergeHttpContext } from 'ngxtension/merge-http-context';

@Injectable()
export class UsersService {
	http = inject(HttpClient);

	getUsers() {
		return this.http.get('api/users', {
			context: mergeHttpContext(withCache(), withLogResponse()),
		});
	}
}
```

```ts name=withLogResponse.ts
const LOG_RESPONSE = new HttpContextToken<boolean>(() => false);

export function withLogResponse(): HttpContext {
	return new HttpContext().set(LOG_RESPONSE, true);
}
```

```ts name=withCache.ts
const CACHE = new HttpContextToken<boolean>(() => false);

export function withCache(): HttpContext {
	return new HttpContext().set(CACHE, true);
}
```
