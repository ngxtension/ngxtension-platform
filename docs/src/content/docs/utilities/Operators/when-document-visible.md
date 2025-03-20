---
title: whenDocumentVisible
description: RxJS operator to pause a stream when the document is hidden and to resume the stream when the document is visible.
entryPoint: ngxtension/when-document-visible
badge: stable
contributors: ['fabiendehopre']
---

## Import

```typescript
import { whenDocumentVisible } from 'ngxtension/when-document-visible';
```

## Usage

You can use it to pause a stream when the document is hidden and to resume the stream when the document is visible.

It uses the same options as the `injectDocumentVisiblity` function.

A good use case is to pause an API polling when the user switches to another tab or another application.

```typescript
import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { poll } from 'ngxtension/poll';
import { whenDocumentVisible } from 'ngxtension/when-document-visible';

const httpClient = inject(HttpClient);
const document = inject(DOCUMENT);
httpClient
	.get('https://api.example.com/data')
	.pipe(
		poll(10000, 5000), // poll every 10s after 5s
		whenDocumentVisible({ document }),
	)
	.subscribe(console.log);
```
