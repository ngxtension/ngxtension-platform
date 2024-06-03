import { fakeAsync, tick } from '@angular/core/testing';
import { timer } from 'rxjs';
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

	it('should emit values only when document is visible', fakeAsync(() => {
		const source = timer(0, 1000);
		const callback = jest.fn();
		triggerVisibilityChange('visible');
		source.pipe(whenDocumentVisible()).subscribe(callback);
		expect(callback).toHaveBeenCalledTimes(1);
		tick(1000);
		expect(callback).toHaveBeenCalledTimes(2);
		triggerVisibilityChange('hidden');
		tick(1000);
		expect(callback).toHaveBeenCalledTimes(2);
		triggerVisibilityChange('visible');
		tick(1000);
		expect(callback).toHaveBeenCalledTimes(3);
	}));
});
