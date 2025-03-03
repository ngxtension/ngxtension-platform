import { fakeAsync, tick } from '@angular/core/testing';
import { BehaviorSubject, map, shareReplay, Subject, timer } from 'rxjs';
import { takeLatestFrom } from './take-latest-from';

describe('takeLatestFrom', () => {
	it('should emit when source emitted and hot observables emit later', fakeAsync(() => {
		let result: string[] | undefined;

		const source = new Subject<string>();
		const obs1 = timer(100).pipe(
			map(() => 'x'),
			shareReplay({ bufferSize: 1, refCount: false }),
		);
		const obs2 = timer(200).pipe(
			map(() => 'y'),
			shareReplay({ bufferSize: 1, refCount: false }),
		);

		source.pipe(takeLatestFrom(() => [obs1, obs2])).subscribe((value) => {
			result = value;
		});

		expect(result).toEqual(undefined);

		source.next('a');

		tick(200);
		expect(result).toEqual(['a', 'x', 'y']);

		source.next('b');
		expect(result).toEqual(['b', 'x', 'y']);

		source.next('c');
		expect(result).toEqual(['c', 'x', 'y']);
	}));

	it('should emit when source emitted and hot observables have a value', fakeAsync(() => {
		let result: string[] | undefined;

		const source = new Subject<string>();
		const obs1 = new BehaviorSubject('x');
		const obs2 = new BehaviorSubject('y');

		source.pipe(takeLatestFrom(() => [obs1, obs2])).subscribe((value) => {
			result = value;
		});

		expect(result).toEqual(undefined);

		source.next('a');

		expect(result).toEqual(['a', 'x', 'y']);

		source.next('b');
		expect(result).toEqual(['b', 'x', 'y']);

		source.next('c');
		expect(result).toEqual(['c', 'x', 'y']);
	}));

	it('should emit when source emitted and cold observables emit later', fakeAsync(() => {
		let result: string[] | undefined;

		const source = new Subject<string>();
		const obs1 = timer(100).pipe(map(() => 'x'));
		const obs2 = timer(200).pipe(map(() => 'y'));

		source.pipe(takeLatestFrom(() => [obs1, obs2])).subscribe((value) => {
			result = value;
		});

		expect(result).toEqual(undefined);

		source.next('a');

		tick(200);
		expect(result).toEqual(['a', 'x', 'y']);

		source.next('b');
		tick(200);
		expect(result).toEqual(['b', 'x', 'y']);

		tick(100);
		expect(result).toEqual(['b', 'x', 'y']);

		source.next('c');
		tick(200);
		expect(result).toEqual(['c', 'x', 'y']);
	}));
});
