import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { injectNetwork } from './inject-network';

describe(injectNetwork.name, () => {
	@Component({
		standalone: true,
		template: `
			{{ networkState.saveData() }}
			{{ networkState.type() }}
			{{ networkState.downlink() }}
			{{ networkState.downlinkMax() }}
			{{ networkState.effectiveType() }}
			{{ networkState.rtt() }}
			{{ networkState.online() }}
			{{ networkState.onlineAt() }}
			{{ networkState.offlineAt() }}
		`,
	})
	class Test {
		networkState = injectNetwork();
	}

	function setup() {
		const fixture = TestBed.createComponent(Test);
		fixture.detectChanges();
		return fixture.componentInstance;
	}

	function triggerOnlineEvent() {
		// Change the visibility state
		Object.defineProperty(navigator, 'onLine', {
			writable: true,
			configurable: true,
			value: true,
		});

		// Dispatch the event
		const event = new Event('online');
		window.dispatchEvent(event);
	}

	function triggerOfflineEvent() {
		// Mock navigator.onLine to return false
		Object.defineProperty(navigator, 'onLine', {
			value: false,
			writable: true,
		});

		// Dispatch the offline event
		const offlineEvent = new Event('offline');
		window.dispatchEvent(offlineEvent);
	}

	it('should handle online state', () => {
		const cmp = setup();
		triggerOnlineEvent();
		expect(cmp.networkState.online()).toEqual(true);
	});

	it('should handle offline state', () => {
		const cmp = setup();
		triggerOfflineEvent();
		expect(cmp.networkState.online()).toEqual(false);
	});
});
