import { signal } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { createResource } from './create-resource';

const promise = <T>(value: T, time: number = 0): Promise<T> =>
	new Promise((resolve) => setTimeout(() => resolve(value), time));

describe(createResource.name, () => {
	it('fetcher only', fakeAsync(() => {
		TestBed.runInInjectionContext(() => {
			const value = signal(1);

			const res = createResource(() =>
				promise(value(), 100).then((v) => {
					logs.push(v);
					return v;
				}),
			);

			const logs: number[] = [];

			expect(res.data()).toEqual(undefined); // initial value
			expect(res.latest()).toEqual(undefined);
			expect(res.status()).toEqual('unresolved');
			expect(res.loading()).toEqual(false);
			expect(res.error()).toEqual(undefined);

			TestBed.flushEffects();

			expect(res.data()).toEqual(undefined);
			expect(res.latest()).toEqual(undefined);
			expect(res.status()).toEqual('pending');
			expect(res.loading()).toEqual(true);
			expect(res.error()).toEqual(undefined);

			tick(100); // wait 100ms for promise to resolve

			expect(res.data()).toEqual(1);
			expect(res.latest()).toEqual(1);
			expect(res.status()).toEqual('ready');
			expect(res.loading()).toEqual(false);
			expect(res.error()).toEqual(undefined);

			expect(logs).toEqual([1]);

			value.set(2);
			TestBed.flushEffects();

			expect(res.data()).toEqual(undefined);
			expect(res.latest()).toEqual(1);
			expect(res.status()).toEqual('pending');
			expect(res.loading()).toEqual(true);
			expect(res.error()).toEqual(undefined);

			tick(100); // wait 100ms for promise to resolve

			expect(res.data()).toEqual(2);
			expect(res.latest()).toEqual(2);
			expect(res.status()).toEqual('ready');
			expect(res.loading()).toEqual(false);
			expect(res.error()).toEqual(undefined);
		});
	}));

	it('fetcher + initial value', fakeAsync(() => {
		TestBed.runInInjectionContext(() => {
			const value = signal(1);

			const res = createResource(
				() =>
					promise(value(), 100).then((v) => {
						logs.push(v);
						return v;
					}),
				{ initialValue: 0 },
			);

			const logs: number[] = [];

			expect(res.data()).toEqual(0); // initial value
			expect(res.latest()).toEqual(0);
			expect(res.status()).toEqual('ready');
			expect(res.loading()).toEqual(false);
			expect(res.error()).toEqual(undefined);

			TestBed.flushEffects();

			expect(res.data()).toEqual(undefined);
			expect(res.latest()).toEqual(0);
			expect(res.status()).toEqual('pending');
			expect(res.loading()).toEqual(true);
			expect(res.error()).toEqual(undefined);

			tick(100); // wait 100ms for promise to resolve

			expect(res.data()).toEqual(1);
			expect(res.latest()).toEqual(1);
			expect(res.status()).toEqual('ready');
			expect(res.loading()).toEqual(false);
			expect(res.error()).toEqual(undefined);

			expect(logs).toEqual([1]);

			value.set(2);
			TestBed.flushEffects();

			expect(res.data()).toEqual(undefined);
			expect(res.latest()).toEqual(1);
			expect(res.status()).toEqual('pending');
			expect(res.loading()).toEqual(true);
			expect(res.error()).toEqual(undefined);

			tick(100); // wait 100ms for promise to resolve

			expect(res.data()).toEqual(2);
			expect(res.latest()).toEqual(2);
			expect(res.status()).toEqual('ready');
			expect(res.loading()).toEqual(false);
			expect(res.error()).toEqual(undefined);
		});
	}));

	it('source + fetcher', fakeAsync(() => {
		TestBed.runInInjectionContext(() => {
			const value = signal(1);
			const fetcher = (id: number) =>
				promise(id, 100).then((v) => {
					logs.push(v);
					return v;
				});

			const res = createResource<number>(
				value,
				// TODO: fix types
				// @ts-ignore
				fetcher,
			);

			const logs: number[] = [];

			expect(res.data()).toEqual(undefined); // initial value
			expect(res.latest()).toEqual(undefined);
			expect(res.status()).toEqual('unresolved');
			expect(res.loading()).toEqual(false);
			expect(res.error()).toEqual(undefined);

			TestBed.flushEffects();

			expect(res.data()).toEqual(undefined);
			expect(res.latest()).toEqual(undefined);
			expect(res.status()).toEqual('pending');
			expect(res.loading()).toEqual(true);
			expect(res.error()).toEqual(undefined);

			tick(100); // wait 100ms for promise to resolve

			expect(res.data()).toEqual(1);
			expect(res.latest()).toEqual(1);
			expect(res.status()).toEqual('ready');
			expect(res.loading()).toEqual(false);
			expect(res.error()).toEqual(undefined);

			expect(logs).toEqual([1]);

			value.set(2);
			TestBed.flushEffects();

			expect(res.data()).toEqual(undefined);
			expect(res.latest()).toEqual(1);
			expect(res.status()).toEqual('pending');
			expect(res.loading()).toEqual(true);
			expect(res.error()).toEqual(undefined);

			tick(100); // wait 100ms for promise to resolve

			expect(res.data()).toEqual(2);
			expect(res.latest()).toEqual(2);
			expect(res.status()).toEqual('ready');
			expect(res.loading()).toEqual(false);
			expect(res.error()).toEqual(undefined);
		});
	}));

	it('source + fetcher + initial value', fakeAsync(() => {
		TestBed.runInInjectionContext(() => {
			const value = signal(1);
			const fetcher = (id: number) =>
				promise(id, 100).then((v) => {
					logs.push(v);
					return v;
				});

			const res = createResource<number>(
				value,
				// TODO: fix types
				// @ts-ignore
				fetcher,
				{ initialValue: 0 },
			);

			const logs: number[] = [];

			expect(res.data()).toEqual(0); // initial value
			expect(res.latest()).toEqual(0);
			expect(res.status()).toEqual('ready');
			expect(res.loading()).toEqual(false);
			expect(res.error()).toEqual(undefined);

			TestBed.flushEffects();

			expect(res.data()).toEqual(undefined);
			expect(res.latest()).toEqual(0);
			expect(res.status()).toEqual('pending');
			expect(res.loading()).toEqual(true);
			expect(res.error()).toEqual(undefined);

			tick(100); // wait 100ms for promise to resolve

			expect(res.data()).toEqual(1);
			expect(res.latest()).toEqual(1);
			expect(res.status()).toEqual('ready');
			expect(res.loading()).toEqual(false);
			expect(res.error()).toEqual(undefined);

			expect(logs).toEqual([1]);

			value.set(2);
			TestBed.flushEffects();

			expect(res.data()).toEqual(undefined);
			expect(res.latest()).toEqual(1);
			expect(res.status()).toEqual('pending');
			expect(res.loading()).toEqual(true);
			expect(res.error()).toEqual(undefined);

			tick(100); // wait 100ms for promise to resolve

			expect(res.data()).toEqual(2);
			expect(res.latest()).toEqual(2);
			expect(res.status()).toEqual('ready');
			expect(res.loading()).toEqual(false);
			expect(res.error()).toEqual(undefined);
		});
	}));

	it('refresh', fakeAsync(() => {
		TestBed.runInInjectionContext(() => {
			const value = signal(1);

			const res = createResource(() =>
				promise(value(), 100).then((v) => {
					logs.push(v);
					return v;
				}),
			);

			const logs: number[] = [];

			expect(res.data()).toEqual(undefined); // initial value
			expect(res.latest()).toEqual(undefined);
			expect(res.status()).toEqual('unresolved');
			expect(res.loading()).toEqual(false);
			expect(res.error()).toEqual(undefined);

			TestBed.flushEffects();

			expect(res.data()).toEqual(undefined);
			expect(res.latest()).toEqual(undefined);
			expect(res.status()).toEqual('pending');
			expect(res.loading()).toEqual(true);
			expect(res.error()).toEqual(undefined);

			tick(100); // wait 100ms for promise to resolve

			expect(res.data()).toEqual(1);
			expect(res.latest()).toEqual(1);
			expect(res.status()).toEqual('ready');
			expect(res.loading()).toEqual(false);
			expect(res.error()).toEqual(undefined);

			expect(logs).toEqual([1]);

			res.refetch();
			TestBed.flushEffects(); // depends on the effect to trigger the refetch

			expect(res.data()).toEqual(undefined);
			expect(res.latest()).toEqual(1);
			expect(res.status()).toEqual('refreshing');
			expect(res.loading()).toEqual(true);
			expect(res.error()).toEqual(undefined);

			tick(100); // wait 100ms for promise to resolve

			expect(res.data()).toEqual(1);
			expect(res.latest()).toEqual(1);
			expect(res.status()).toEqual('ready');
			expect(res.loading()).toEqual(false);
			expect(res.error()).toEqual(undefined);
		});
	}));

	it('mutate', fakeAsync(() => {
		TestBed.runInInjectionContext(() => {
			const value = signal(1);

			const res = createResource(() =>
				promise(value(), 100).then((v) => {
					logs.push(v);
					return v;
				}),
			);

			const logs: number[] = [];

			expect(res.data()).toEqual(undefined); // initial value
			expect(res.latest()).toEqual(undefined);
			expect(res.status()).toEqual('unresolved');
			expect(res.loading()).toEqual(false);
			expect(res.error()).toEqual(undefined);

			TestBed.flushEffects();

			expect(res.data()).toEqual(undefined);
			expect(res.latest()).toEqual(undefined);
			expect(res.status()).toEqual('pending');
			expect(res.loading()).toEqual(true);
			expect(res.error()).toEqual(undefined);

			tick(100); // wait 100ms for promise to resolve

			expect(res.data()).toEqual(1);
			expect(res.latest()).toEqual(1);
			expect(res.status()).toEqual('ready');
			expect(res.loading()).toEqual(false);
			expect(res.error()).toEqual(undefined);

			expect(logs).toEqual([1]);

			res.mutate(2);

			expect(res.data()).toEqual(2);
			expect(res.latest()).toEqual(2);
			expect(res.status()).toEqual('ready');
			expect(res.loading()).toEqual(false);
			expect(res.error()).toEqual(undefined);

			expect(logs).toEqual([1]);

			// change the value to trigger the fetcher again
			value.set(3);
			TestBed.flushEffects();

			expect(res.data()).toEqual(undefined);
			expect(res.latest()).toEqual(2);
			expect(res.status()).toEqual('pending');
			expect(res.loading()).toEqual(true);
			expect(res.error()).toEqual(undefined);

			tick(100); // wait 100ms for promise to resolve

			expect(res.data()).toEqual(3);
			expect(res.latest()).toEqual(3);
			expect(res.status()).toEqual('ready');
			expect(res.loading()).toEqual(false);
			expect(res.error()).toEqual(undefined);

			expect(logs).toEqual([1, 3]);
		});
	}));
});
