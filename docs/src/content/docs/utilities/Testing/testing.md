---
title: Testing Utilities
description: Small async helpers for Angular component tests, to wait for the app to stabilize, retry an assertion until it passes and wait for text to appear.
entryPoint: ngxtension/testing
badge: experimental
contributors: []
---

`ngxtension/testing` has three small helpers for async component tests: `act` waits for Angular to settle after a change, `waitFor` retries an assertion until it passes, and `expectText` waits until some text shows up in the rendered component. They work with Jest, Vitest or Jasmine, and are most useful in zoneless tests where `fakeAsync` isn't available.

## Usage

```ts
import {
	Component,
	provideZonelessChangeDetection,
	signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { act, expectText, waitFor } from 'ngxtension/testing';

@Component({
	selector: 'app-counter',
	template: `
		<p>Count: {{ count() }}</p>
	`,
})
class CounterComponent {
	readonly count = signal(0);
}

describe('CounterComponent', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [provideZonelessChangeDetection()],
		});
	});

	it('renders the new count', async () => {
		const fixture = TestBed.createComponent(CounterComponent);

		await act(() => fixture.componentInstance.count.set(1));

		await expectText('Count: 1');
	});
});
```

:::note
`provideZonelessChangeDetection()` is stable from Angular 20. On Angular 19, use `provideExperimentalZonelessChangeDetection()`.
:::

## act

Runs a function, then waits for `ApplicationRef.whenStable()`: pending change detection, effects and the app's tracked async work have finished. Use it after anything that changes state, such as setting a signal, clicking a button or flushing an HTTP request.

```ts
const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');

await act(() => button.click());

expect(fixture.nativeElement.textContent).toContain('Saved');
```

`act` resolves to whatever your function returns.

In zone-based tests, `act` waits for the zone to settle but doesn't render the fixture on its own. Turn on `fixture.autoDetectChanges()` or call `fixture.detectChanges()` after it.

## waitFor

Calls a function again and again until it **stops throwing**, then resolves with its return value. If it still throws when the timeout runs out, `waitFor` rejects with the last error. Put your assertions inside it:

```ts
await waitFor(() => {
	expect(fixture.nativeElement.querySelector('.spinner')).toBeNull();
});

// Resolve with a value once it's available
const row = await waitFor(() => {
	const el = fixture.nativeElement.querySelector('tr');
	if (!el) throw new Error('No rows yet');
	return el;
});
```

:::caution
Returning `false` doesn't make `waitFor` retry: it resolves right away with `false`. Throw (or use `expect`) for the condition you're waiting for.
:::

The callback can be async. `waitFor` uses the real clock, so it keeps working in tests that use fake timers.

## expectText

Waits until the rendered component's text contains a string, or matches a regular expression. It rejects with the actual text when the timeout runs out.

```ts
await expectText('Welcome back');
await expectText(/\d+ results/, { timeout: 1000 });
```

By default it reads the `textContent` of the first fixture created with `TestBed.createComponent`, so create one first. Pass `container` to search somewhere else:

```ts
const dialog = document.querySelector<HTMLElement>('.cdk-overlay-pane')!;
await expectText('Are you sure?', { container: dialog });
```

`expectText` doesn't run change detection. In a zone-based test without `autoDetectChanges()`, call `fixture.detectChanges()` or use `act` first.

## API

```ts
function act<T>(fn: () => T): Promise<T>;

function waitFor<T>(
	callback: () => Promise<T> | T,
	options?: WaitForOptions,
): Promise<T>;

function expectText(
	text: string | RegExp,
	options?: ExpectTextOptions,
): Promise<void>;
```

| Option      | Type          | Default                        | Description                                                                            |
| ----------- | ------------- | ------------------------------ | -------------------------------------------------------------------------------------- |
| `timeout`   | `number`      | `100`                          | Milliseconds to keep retrying before rejecting.                                        |
| `interval`  | `number`      | `0`                            | Milliseconds between attempts. There's always at least one macrotask between attempts. |
| `container` | `HTMLElement` | first active fixture's element | `expectText` only. Element whose text to check.                                        |

:::tip
The default timeout is short (100 ms). Raise it for anything that waits on real timers or debounced input.
:::
