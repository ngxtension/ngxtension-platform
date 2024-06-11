import { Injector } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Observable, timer } from 'rxjs';
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
});
