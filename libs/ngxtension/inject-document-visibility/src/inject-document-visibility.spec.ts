import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { injectDocumentVisibility } from './inject-document-visibility';

describe(injectDocumentVisibility.name, () => {
	@Component({ standalone: true, template: '{{visibilityState()}}' })
	class Test {
		visibilityState = injectDocumentVisibility();
	}

	function setup() {
		const fixture = TestBed.createComponent(Test);
		fixture.detectChanges();
		return fixture.componentInstance;
	}

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

	it('should work properly', () => {
		const cmp = setup();
		triggerVisibilityChange('hidden');
		expect(cmp.visibilityState()).toEqual('hidden');
		triggerVisibilityChange('visible');
		expect(cmp.visibilityState()).toEqual('visible');
	});
});
