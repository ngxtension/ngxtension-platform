import { fakeAsync, tick } from '@angular/core/testing';
import { of } from 'rxjs';
import { poll } from './poll';

describe(poll.name, () => {
	it('should return an observable that polls every 1000ms', fakeAsync(() => {
		const callback = jest.fn();
		const source = of('test');
		const result = source.pipe(poll(1000));
		const sub = result.subscribe(() => {
			callback();
		});
		expect(callback).toHaveBeenCalledTimes(0);
		tick(1000);
		expect(callback).toHaveBeenCalledTimes(2);
		tick(1000);
		expect(callback).toHaveBeenCalledTimes(3);
		sub.unsubscribe();
		tick(1000);
		expect(callback).toHaveBeenCalledTimes(3);
	}));

	it('should return an observable that polls every 1000ms after 500ms', fakeAsync(() => {
		const callback = jest.fn();
		const source = of('test');
		const result = source.pipe(poll(1000, 500));
		const sub = result.subscribe(() => {
			callback();
		});
		expect(callback).toHaveBeenCalledTimes(0);
		tick(500);
		expect(callback).toHaveBeenCalledTimes(1);
		tick(1000);
		expect(callback).toHaveBeenCalledTimes(2);
		tick(1000);
		expect(callback).toHaveBeenCalledTimes(3);
		sub.unsubscribe();
		tick(1000);
		expect(callback).toHaveBeenCalledTimes(3);
	}));
});
