import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { createRepeat } from './create-repeat';

type Tests = {
	expectation: string;
	input: {
		globalCount?: number;
		emitCount: number;
		count?: number;
	};
	expected: number[];
}[];

describe('createRepeat', () => {
	const sourceValue = 123;

	const tests: Tests = [
		{
			expectation: 'should repeat the source stream once after repeat emits',
			input: { emitCount: 1 },
			expected: [sourceValue, sourceValue],
		},
		{
			expectation:
				'should emit the source stream value only once with the global count set to 1',
			input: { globalCount: 1, emitCount: 2 },
			expected: [sourceValue],
		},
		{
			expectation:
				'should emit the source stream value twice with the global count set to 2',
			input: { globalCount: 2, emitCount: 2 },
			expected: [sourceValue, sourceValue],
		},
		{
			expectation:
				'should emit the source stream value twice with the count set to 2',
			input: { count: 2, emitCount: 2 },
			expected: [sourceValue, sourceValue],
		},
		{
			expectation:
				'should emit the source stream value twice with the count set to 2, even if the global count is set to 1',
			input: { globalCount: 1, count: 2, emitCount: 2 },
			expected: [sourceValue, sourceValue],
		},
	];

	tests.forEach(
		({ expectation, input: { globalCount, count, emitCount }, expected }) =>
			it(expectation, () =>
				TestBed.runInInjectionContext(() => {
					const repeat = createRepeat(globalCount);
					const notifs: number[] = [];

					of(sourceValue)
						.pipe(repeat(count))
						.subscribe((n) => notifs.push(n));

					for (let i = 0; i < emitCount; i++) repeat.emit();

					expect(notifs).toEqual(expected);
				}),
			),
	);

	it('should throw an error when it is invoked outside an injection context', () =>
		expect(createRepeat).toThrow());
});
