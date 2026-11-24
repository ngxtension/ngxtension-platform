import { Injector } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { defer, map, Observable, throwError, timer } from 'rxjs';
import { whenDocumentVisible } from './when-document-visible';

describe(whenDocumentVisible.name, () => {
	function triggerVisibilityChange(newState: DocumentVisibilityState) {
		// Change the visibility state
		Object.defineProperty(document, 'visibilityState', {
			writable: true,
			configurable: true,
			value: newState,
		});

		// Dispatch the event
		const event = new Event('visibilitychange');
		document.dispatchEvent(event);
	}

	describe('should emit values only when document is visible', () => {
		const runTest = (source: Observable<number>): void => {
			const callback = jest.fn();
			triggerVisibilityChange('visible');
			const sub = source.subscribe(callback);
			tick(); // trigger initial emission
			expect(callback).toHaveBeenCalledTimes(1);
			tick(10_000); // will emit 10 times in 10 seconds
			expect(callback).toHaveBeenCalledTimes(11);
			triggerVisibilityChange('hidden');
			tick(10_000);
			expect(callback).toHaveBeenCalledTimes(11);
			triggerVisibilityChange('visible');
			tick(10_000); // will emit 11 times (once initially and 10 times in 10 seconds)
			expect(callback).toHaveBeenCalledTimes(22);
			sub.unsubscribe();
		};

		it('should emit values only when document is visible using provided injector', fakeAsync(() => {
			const source = timer(0, 1000);
			runTest(
				source.pipe(
					whenDocumentVisible({ injector: TestBed.inject(Injector) }),
				),
			);
		}));

		it('should emit values only when document is visible in injector context', fakeAsync(() => {
			TestBed.runInInjectionContext(() => {
				const source = timer(0, 1000);
				runTest(source.pipe(whenDocumentVisible()));
			});
		}));

		it('should emit values only when document is visible using provided document', fakeAsync(() => {
			TestBed.runInInjectionContext(() => {
				const source = timer(0, 1000);
				runTest(source.pipe(whenDocumentVisible({ document })));
			});
		}));
	});
	describe('when the source completes or errors', () => {
		function countedSource(delay: number) {
			let subscriptions = 0;
			const source = defer(() => {
				subscriptions++;
				return timer(delay).pipe(map(() => subscriptions));
			});
			return { source, subscriptions: () => subscriptions };
		}

		it('should complete and not resubscribe when the source completes while visible', fakeAsync(() => {
			const { source, subscriptions } = countedSource(10);
			const next = jest.fn();
			const complete = jest.fn();
			triggerVisibilityChange('visible');

			source
				.pipe(whenDocumentVisible({ injector: TestBed.inject(Injector) }))
				.subscribe({ next, complete });
			tick(1_000);

			expect(subscriptions()).toBe(1);
			expect(next).toHaveBeenCalledTimes(1);
			expect(next).toHaveBeenCalledWith(1);
			expect(complete).toHaveBeenCalledTimes(1);

			triggerVisibilityChange('hidden');
			triggerVisibilityChange('visible');
			tick(1_000);

			expect(subscriptions()).toBe(1);
			expect(next).toHaveBeenCalledTimes(1);
		}));

		it('should resubscribe when the source was interrupted by the document being hidden', fakeAsync(() => {
			const { source, subscriptions } = countedSource(1_000);
			const next = jest.fn();
			const complete = jest.fn();
			triggerVisibilityChange('visible');

			source
				.pipe(whenDocumentVisible({ injector: TestBed.inject(Injector) }))
				.subscribe({ next, complete });
			tick(500);
			triggerVisibilityChange('hidden');
			tick(5_000);

			expect(subscriptions()).toBe(1);
			expect(next).not.toHaveBeenCalled();
			expect(complete).not.toHaveBeenCalled();

			triggerVisibilityChange('visible');
			tick(1_000);

			expect(subscriptions()).toBe(2);
			expect(next).toHaveBeenCalledTimes(1);
			expect(complete).toHaveBeenCalledTimes(1);
		}));

		it('should not subscribe to the source until the document is visible', fakeAsync(() => {
			const { source, subscriptions } = countedSource(10);
			const next = jest.fn();
			triggerVisibilityChange('hidden');

			source
				.pipe(whenDocumentVisible({ injector: TestBed.inject(Injector) }))
				.subscribe(next);
			tick(1_000);
			expect(subscriptions()).toBe(0);

			triggerVisibilityChange('visible');
			tick(1_000);
			expect(subscriptions()).toBe(1);
			expect(next).toHaveBeenCalledTimes(1);
		}));

		it('should forward errors from the source', fakeAsync(() => {
			const error = jest.fn();
			triggerVisibilityChange('visible');

			throwError(() => new Error('boom'))
				.pipe(whenDocumentVisible({ injector: TestBed.inject(Injector) }))
				.subscribe({ error });
			tick();

			expect(error).toHaveBeenCalledTimes(1);
		}));
	});
});
