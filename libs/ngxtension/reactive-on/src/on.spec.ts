import {
	ApplicationRef,
	Injector,
	computed,
	effect,
	signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { on } from './on';

describe(on.name, () => {
	let injector: Injector;
	let appRef: ApplicationRef;

	beforeEach(() => {
		injector = TestBed.inject(Injector);
		appRef = TestBed.inject(ApplicationRef);
	});

	it('should run effect when dependency changes (single)', () => {
		const count = signal(0);
		const log: number[] = [];

		effect(
			on(count, (c) => {
				log.push(c);
			}),
			{ injector },
		);

		appRef.tick();
		expect(log).toEqual([0]);

		count.set(1);
		appRef.tick();
		expect(log).toEqual([0, 1]);
	});

	it('should not run effect when untracked dependency changes', () => {
		const count = signal(0);
		const other = signal(10);
		const log: number[] = [];

		effect(
			on(count, (c) => {
				// accessing 'other' which is not in deps
				log.push(c + other());
			}),
			{ injector },
		);

		appRef.tick();
		expect(log).toEqual([10]);

		other.set(20);
		appRef.tick();
		// Should NOT run again because 'other' is not in deps list passed to on()
		expect(log).toEqual([10]);

		count.set(1);
		appRef.tick();
		// Should run now, seeing the new value of 'other' ONLY because 'count' changed
		expect(log).toEqual([10, 21]);
	});

	it('should run effect with multiple dependencies (array)', () => {
		const a = signal(1);
		const b = signal(2);
		const log: number[] = [];

		effect(
			on([a, b], ([valA, valB]) => {
				log.push(valA + valB);
			}),
			{ injector },
		);

		appRef.tick();
		expect(log).toEqual([3]);

		a.set(2);
		appRef.tick();
		expect(log).toEqual([3, 4]);

		b.set(3);
		appRef.tick();
		expect(log).toEqual([3, 4, 5]);
	});

	it('should pass object with signals as input', () => {
		const a = signal(1);
		const b = signal(2);
		const log: number[] = [];

		effect(
			on({ a, b }, ({ a: valA, b: valB }) => {
				log.push(valA * valB);
			}),
			{ injector },
		);

		appRef.tick();
		expect(log).toEqual([2]);

		a.set(3);
		appRef.tick();
		expect(log).toEqual([2, 6]);

		b.set(4);
		appRef.tick();
		expect(log).toEqual([2, 6, 12]);
	});

	it('should pass previous input correctly', () => {
		const count = signal(0);
		const log: string[] = [];

		effect(
			on(count, (input, prevInput) => {
				const result = `cur: ${input}, prevIn: ${prevInput}`;
				log.push(result);
				return undefined;
			}),
			{ injector },
		);

		appRef.tick();
		expect(log).toEqual(['cur: 0, prevIn: undefined']);

		count.set(1);
		appRef.tick();
		expect(log).toEqual(['cur: 0, prevIn: undefined', 'cur: 1, prevIn: 0']);
	});

	it('should support cleanup function', () => {
		const count = signal(0);
		const log: string[] = [];

		const effectRef = effect(
			on(count, (c, _, __, onCleanup) => {
				log.push(`run: ${c}`);
				onCleanup(() => {
					log.push(`cleanup: ${c}`);
				});
			}),
			{ injector },
		);

		appRef.tick();
		expect(log).toEqual(['run: 0']);

		count.set(1);
		appRef.tick();
		expect(log).toEqual(['run: 0', 'cleanup: 0', 'run: 1']);

		effectRef.destroy();
		expect(log).toEqual(['run: 0', 'cleanup: 0', 'run: 1', 'cleanup: 1']);
	});

	it('should pass previous value correctly', () => {
		const count = signal(1);
		const log: number[] = [];

		effect(
			on(count, (c, _, prevValue) => {
				const result = c + ((prevValue as number) || 0);
				log.push(result);
				return result;
			}),
			{ injector },
		);

		appRef.tick();
		expect(log).toEqual([1]); // 1 + 0 (undefined prevValue treated as 0)

		count.set(2);
		appRef.tick();
		expect(log).toEqual([1, 3]); // 2 + 1 (prevValue was 1)

		count.set(3);
		appRef.tick();
		expect(log).toEqual([1, 3, 6]); // 3 + 3 (prevValue was 3)
	});

	it('should work with computed signals', () => {
		const count = signal(1);
		const doubleCount = computed(() => count() * 2);
		const log: number[] = [];

		effect(
			on(doubleCount, (val) => {
				log.push(val);
			}),
			{ injector },
		);

		appRef.tick();
		expect(log).toEqual([2]);

		count.set(2);
		appRef.tick();
		expect(log).toEqual([2, 4]);
	});

	it('should not run if defer is true and dependencies did not change', () => {
		const count = signal(0);
		const log: number[] = [];

		effect(
			on(
				count,
				(c) => {
					log.push(c);
				},
				{ defer: true },
			),
			{ injector },
		);

		appRef.tick();
		expect(log).toEqual([]); // Should not run on initial tick due to defer

		count.set(1);
		appRef.tick();
		expect(log).toEqual([1]); // Should run now because count changed

		count.set(1);
		appRef.tick();
		expect(log).toEqual([1]); // Should NOT run again because count did not change
	});
});
