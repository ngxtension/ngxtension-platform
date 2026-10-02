import {
	ApplicationRef,
	Injector,
	afterRenderEffect,
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
				log.push(c + other());
			}),
			{ injector },
		);

		appRef.tick();
		expect(log).toEqual([10]);

		other.set(20);
		appRef.tick();
		expect(log).toEqual([10]);

		count.set(1);
		appRef.tick();
		expect(log).toEqual([10, 21]);
	});

	it('should run effect with multiple dependencies (array)', () => {
		const a = signal(1);
		const b = signal(2);
		const log: number[] = [];

		effect(
			on(
				() => [a(), b()],
				([valA, valB]) => {
					log.push(valA + valB);
				},
			),
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
			on(
				() => ({ a: a(), b: b() }),
				({ a: valA, b: valB }) => {
					log.push(valA * valB);
				},
			),
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

	it('should support cleanup function', () => {
		const count = signal(0);
		const log: string[] = [];

		const effectRef = effect(
			on(count, (c, onCleanup) => {
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
		expect(log).toEqual([]);

		count.set(1);
		appRef.tick();
		expect(log).toEqual([1]);

		count.set(1);
		appRef.tick();
		expect(log).toEqual([1]);
	});

	it('should work seamlessly with computed', () => {
		const count = signal(1);

		const doubled = computed(on(count, (val) => val * 2));

		expect(doubled()).toEqual(2);

		count.set(3);
		expect(doubled()).toEqual(6);
	});

	it('should work seamlessly with afterRenderEffect', () => {
		const count = signal(0);
		const log: number[] = [];

		afterRenderEffect(
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

	it('should work with afterRenderEffect phases', () => {
		const count = signal(0);
		const log: string[] = [];

		const earlyRead = on(count, (c) => {
			log.push(`earlyRead:${c}`);
			return c;
		});

		const write = on(count, (c) => {
			log.push(`write:${c}`);
			return c;
		});

		const mixedReadWrite = on(count, (c) => {
			log.push(`mixedReadWrite:${c}`);
			return c;
		});

		const read = on(count, (c) => {
			log.push(`read:${c}`);
		});

		afterRenderEffect(
			{
				earlyRead: () => earlyRead(),
				write: () => write(),
				mixedReadWrite: () => mixedReadWrite(),
				read: () => read(),
			},
			{ injector },
		);

		appRef.tick();
		expect(log).toEqual([
			'earlyRead:0',
			'write:0',
			'mixedReadWrite:0',
			'read:0',
		]);

		count.set(1);
		appRef.tick();
		expect(log).toEqual([
			'earlyRead:0',
			'write:0',
			'mixedReadWrite:0',
			'read:0',
			'earlyRead:1',
			'write:1',
			'mixedReadWrite:1',
			'read:1',
		]);
	});
});
