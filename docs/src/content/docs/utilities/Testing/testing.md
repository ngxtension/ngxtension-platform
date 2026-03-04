---
title: Testing Utilities
description: Utilities for testing Angular applications
entryPoint: ngxtension/testing
badge: experimental
contributors: []
---

`ngxtension/testing` provides utilities to help testing Angular applications.

## act

`act` executes a function and waits for the Angular application to stabilize.

This utility helps in testing async state transitions by ensuring that any scheduled effects or microtasks are processed before the promise resolves.

### Usage

```ts
import { act } from 'ngxtension/testing';

it('should verify async state', async () => {
	@Component({
		selector: 'test-component',
		template: `
			<div>{{ value() }}</div>
		`,
	})
	class TestComponent {
		value = signal('initial');
	}

	const fixture = TestBed.createComponent(TestComponent);

	await act(() => {
		fixture.componentInstance.value.set('updated');
	});

	expect(fixture.nativeElement.textContent.trim()).toBe('updated');
});
```

## waitFor

`waitFor` returns a promise that resolves when the provided callback returns a truthy value or completes successfully.

It is useful for waiting for asynchronous updates in tests.

### Usage

```ts
import { waitFor } from 'ngxtension/testing';

it('should wait for condition', async () => {
	await waitFor(() => {
		if (!component.isLoaded) {
			throw new Error('Not loaded yet');
		}
	});

	// or return a value
	const result = await waitFor(() => component.getValue());
});
```

### Options

`waitFor` accepts an optional configuration object:

- `timeout`: Maximum time to wait in milliseconds (default: 100)
- `interval`: Polling interval in milliseconds (default: 0)

```ts
await waitFor(() => checkCondition(), { timeout: 500 });
```

## expectText

`expectText` returns a promise that resolves when the provided element's text content matches the expected text or regex.

### Usage

```ts
import { expectText } from 'ngxtension/testing';

it('should verify text content', async () => {
	// The component we'll check against
	const fixture = TestBed.createComponent(MyHomePage);

	// simple string match
	await expectText('Hello World');

	// regex match
	await expectText(/Hello/);
});
```

### Options

`expectText` accepts an optional configuration object:

- `timeout`: Maximum time to wait in milliseconds (default: 100)
- `interval`: Polling interval in milliseconds (default: 0)
- `container`: HTMLElement to search within (default: active fixture's native element)

```ts
await expectText('Loading...', { timeout: 2000, interval: 100 });
```
