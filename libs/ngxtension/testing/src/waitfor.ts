import { TestBed } from '@angular/core/testing';

export interface WaitForOptions {
	timeout?: number;
	interval?: number;
}

export interface ExpectTextOptions extends WaitForOptions {
	container?: HTMLElement;
}

/**
 * Returns a promise that resolves when the text content is found on the screen.
 *
 * @param text - The expected text content, regex, or matcher function.
 *
 * @example
 * ```ts
 * await expectText('Hello');
 * await expectText(/Hello/);
 * ```
 */
export async function expectText(
	text: string | RegExp,
	options: ExpectTextOptions = {},
): Promise<void> {
	// TestBed.getFixture will be
	const container =
		options.container ||
		// The following is the implementation of TestBed.getFixture that will be introduced in Angular v22.
		(TestBed as any).INSTANCE._activeFixtures[0].nativeElement;
	await waitFor(() => {
		const content = container.textContent || '';
		if (typeof text === 'string') {
			if (!content.includes(text)) {
				throw new Error(
					`Expected text "${text}" not found in content: "${content}"`,
				);
			}
		} else {
			if (!text.test(content)) {
				throw new Error(
					`Expected text matching ${text} not found in content: "${content}"`,
				);
			}
		}
	}, options);
}

// Intentionally does not participate in fake clocks.
const realNow = performance.now.bind(performance);
const realSetTimeout = setTimeout;

/**
 * @param callback - The function to execute until it succeeds or times out.
 * @param options - Optional configuration for timeout and retry interval.
 *
 * Note: the implementation of this function makes sure to not participate in fake timers,
 * so that it can be used in tests that use fake timers without being affected by them.
 */
export async function waitFor<T>(
	callback: () => Promise<T> | T,
	options: WaitForOptions = {},
): Promise<T> {
	const waitTime = options.timeout ?? 100;
	const interval = options.interval ?? 0;
	const stack = new Error().stack;

	const deadline = realNow() + waitTime;
	let i = 0;
	let lastError: any | undefined;

	while (true) {
		try {
			return await callback();
		} catch (cause) {
			lastError = cause;
		}

		i++;

		if (deadline < realNow()) {
			throw Object.assign(
				new Error(
					`Timed out after ${waitTime}ms and ${i} attempts. ` +
						`Last error: ${lastError?.message ?? 'condition returned false'}`,
				),
				{
					stack:
						stack +
						`Last error: ${lastError?.stack ?? 'condition returned false'}`,
				},
			);
		}

		// Guarantee a macro-task between retries.
		await new Promise((resolve) => void realSetTimeout(resolve, interval));
	}
}
