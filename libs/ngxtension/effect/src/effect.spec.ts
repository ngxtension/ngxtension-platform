import { ApplicationRef, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { effect, nullishValues } from './effect';

describe('effect', () => {
	let appRef: ApplicationRef;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		appRef = TestBed.inject(ApplicationRef);
	});

	it('skips the initial trigger and passes current and previous dependency values', () => {
		const first = signal(1);
		const second = signal('a');
		const callback = jest.fn();

		TestBed.runInInjectionContext(() => {
			effect([first, second], { defer: true }, callback);
		});
		appRef.tick();

		expect(callback).not.toHaveBeenCalled();

		first.set(2);
		appRef.tick();

		expect(callback).toHaveBeenNthCalledWith(
			1,
			[2, 'a'],
			[undefined, undefined],
			expect.any(Function),
			undefined,
		);

		second.set('b');
		appRef.tick();

		expect(callback).toHaveBeenNthCalledWith(
			2,
			[2, 'b'],
			[2, 'a'],
			expect.any(Function),
			undefined,
		);
	});

	it('skips callback execution when any dependency value is nullish', () => {
		const first = signal<number | null>(1);
		const second = signal<string | undefined>('a');
		const callback = jest.fn();

		TestBed.runInInjectionContext(() => {
			effect([first, second], { filter: nullishValues }, callback);
		});
		appRef.tick();

		expect(callback).toHaveBeenNthCalledWith(
			1,
			[1, 'a'],
			[undefined, undefined],
			expect.any(Function),
			undefined,
		);

		first.set(null);
		appRef.tick();

		second.set(undefined);
		appRef.tick();

		first.set(2);
		appRef.tick();

		expect(callback).toHaveBeenCalledTimes(1);

		second.set('b');
		appRef.tick();

		expect(callback).toHaveBeenNthCalledWith(
			2,
			[2, 'b'],
			[1, 'a'],
			expect.any(Function),
			undefined,
		);
	});

	it('executes the callback only once after skipped runs', () => {
		const dependency = signal<number | null>(null);
		const callback = jest.fn();

		TestBed.runInInjectionContext(() => {
			effect([dependency], { once: true, filter: nullishValues }, callback);
		});
		appRef.tick();

		expect(callback).not.toHaveBeenCalled();

		dependency.set(1);
		appRef.tick();

		expect(callback).toHaveBeenNthCalledWith(
			1,
			[1],
			[undefined],
			expect.any(Function),
			undefined,
		);

		dependency.set(2);
		appRef.tick();

		expect(callback).toHaveBeenCalledTimes(1);
	});

	it('can execute only once on the initial trigger', () => {
		const dependency = signal(1);
		const callback = jest.fn();

		TestBed.runInInjectionContext(() => {
			effect([dependency], { once: true }, callback);
		});
		appRef.tick();

		expect(callback).toHaveBeenNthCalledWith(
			1,
			[1],
			[undefined],
			expect.any(Function),
			undefined,
		);

		dependency.set(2);
		appRef.tick();

		expect(callback).toHaveBeenCalledTimes(1);
	});

	it('executes only once when the filtered dependency is available', () => {
		const dependency = signal(0);
		const callback = jest.fn();

		TestBed.runInInjectionContext(() => {
			effect(
				[() => (dependency() === 2 ? 'ready' : null)],
				{ once: true, filter: nullishValues },
				callback,
			);
		});
		appRef.tick();

		expect(callback).not.toHaveBeenCalled();

		dependency.set(1);
		appRef.tick();

		expect(callback).not.toHaveBeenCalled();

		dependency.set(2);
		appRef.tick();

		expect(callback).toHaveBeenNthCalledWith(
			1,
			['ready'],
			[undefined],
			expect.any(Function),
			undefined,
		);

		dependency.set(3);
		appRef.tick();

		expect(callback).toHaveBeenCalledTimes(1);
	});

	it('can gate explicit dependencies with a filter', () => {
		const dependency = signal('idle');
		const ready = signal(false);
		const callback = jest.fn();

		TestBed.runInInjectionContext(() => {
			effect([dependency], { once: true, filter: () => ready() }, callback);
		});
		appRef.tick();

		dependency.set('waiting');
		appRef.tick();

		expect(callback).not.toHaveBeenCalled();

		ready.set(true);
		appRef.tick();

		expect(callback).toHaveBeenNthCalledWith(
			1,
			['waiting'],
			[undefined],
			expect.any(Function),
			undefined,
		);

		dependency.set('done');
		appRef.tick();

		expect(callback).toHaveBeenCalledTimes(1);
	});

	it('passes the previous callback return value', () => {
		const dependency = signal(1);
		const log: number[] = [];

		TestBed.runInInjectionContext(() => {
			effect(
				[dependency],
				(
					[value],
					_prevDepValues,
					_onCleanup,
					prevReturnValue: number | undefined,
				) => {
					const result = value + (prevReturnValue ?? 0);
					log.push(result);
					return result;
				},
			);
		});
		appRef.tick();

		expect(log).toEqual([1]);

		dependency.set(2);
		appRef.tick();

		expect(log).toEqual([1, 3]);

		dependency.set(3);
		appRef.tick();

		expect(log).toEqual([1, 3, 6]);
	});

	it('runs the callback in an untracked context', () => {
		const dependency = signal(0);
		const incidental = signal('a');
		const callback = jest.fn(() => incidental());

		TestBed.runInInjectionContext(() => {
			effect([dependency], { defer: true }, callback);
		});
		appRef.tick();

		dependency.set(1);
		appRef.tick();

		expect(callback).toHaveBeenCalledTimes(1);

		incidental.set('b');
		appRef.tick();

		expect(callback).toHaveBeenCalledTimes(1);

		dependency.set(2);
		appRef.tick();

		expect(callback).toHaveBeenCalledTimes(2);
	});
});
