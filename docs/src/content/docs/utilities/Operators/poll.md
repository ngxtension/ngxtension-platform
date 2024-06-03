---
title: poll
description: RxJS operator to apply to a stream that you want to poll every "period" milliseconds after an optional "initialDelay" milliseconds.
entryPoint: poll
badge: stable
contributors: ['fabiendehopre']
---

## Import

```typescript
import { poll } from 'ngxtension/poll';
```

## Usage

You can use it like the `repeat` operator, but with the ability to delay each emission. It accepts the same parameters as the `timer` function.

It's great to poll and API at a fixed interval with an optional initial delay.

```typescript
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { poll } from 'ngxtension/poll';

const httpClient = inject(HttpClient);
httpClient
	.get('https://api.example.com/data')
	.pipe(
		poll(10000, 5000), // poll every 10s after 5s
	)
	.subscribe(console.log);
```
