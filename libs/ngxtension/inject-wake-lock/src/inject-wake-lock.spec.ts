import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { type WakeLockSentinel, injectWakeLock } from './inject-wake-lock';

class MockWakeLockSentinel extends EventTarget implements WakeLockSentinel {
	type: 'screen' = 'screen';
	released = false;

	async release() {
		this.released = true;
		this.dispatchEvent(new Event('release'));
	}
}

class MockDocument extends EventTarget {
	visibilityState: DocumentVisibilityState = 'hidden';
}

function defineWakeLockAPI(navigator: Navigator) {
	let sentinel: MockWakeLockSentinel | null = null;
	const api = {
		request: async () => {
			sentinel = new MockWakeLockSentinel();
			return sentinel;
		},
		getCurrentSentinel: () => sentinel,
	};
	Object.defineProperty(navigator, 'wakeLock', {
		value: api,
		writable: true,
		configurable: true,
	});
	return api;
}

describe(injectWakeLock.name, () => {
	@Component({ standalone: true, template: '' })
	class TestComponent {
		wakeLock = injectWakeLock();
	}

	function setup() {
		const fixture = TestBed.createComponent(TestComponent);
		fixture.detectChanges();
		return fixture.componentInstance;
	}

	beforeEach(() => {
		// Clean up navigator.wakeLock
		if ('wakeLock' in navigator) {
			delete (navigator as any).wakeLock;
		}
	});

	it('should create wake lock instance', () => {
		const cmp = setup();
		expect(cmp.wakeLock).toBeDefined();
		expect(cmp.wakeLock.isSupported).toBeDefined();
		expect(cmp.wakeLock.isActive).toBeDefined();
		expect(cmp.wakeLock.sentinel).toBeDefined();
		expect(cmp.wakeLock.request).toBeDefined();
		expect(cmp.wakeLock.forceRequest).toBeDefined();
		expect(cmp.wakeLock.release).toBeDefined();
	});

	it('isActive should not change if not supported', async () => {
		@Component({ standalone: true, template: '' })
		class TestUnsupportedComponent {
			wakeLock = injectWakeLock({ navigator: {} as Navigator });
		}

		const fixture = TestBed.createComponent(TestUnsupportedComponent);
		fixture.detectChanges();
		const cmp = fixture.componentInstance;

		expect(cmp.wakeLock.isSupported()).toBe(false);
		expect(cmp.wakeLock.isActive()).toBe(false);

		await cmp.wakeLock.request('screen');

		expect(cmp.wakeLock.isActive()).toBe(false);

		await cmp.wakeLock.release();

		expect(cmp.wakeLock.isActive()).toBe(false);
	});

	it('isActive should change if supported', async () => {
		const mockNavigator = {} as Navigator;
		defineWakeLockAPI(mockNavigator);

		// Mock document as visible
		const mockDocument = {
			visibilityState: 'visible',
			addEventListener: jest.fn(),
			removeEventListener: jest.fn(),
		} as any;

		@Component({ standalone: true, template: '' })
		class TestSupportedComponent {
			wakeLock = injectWakeLock({
				navigator: mockNavigator,
				document: mockDocument,
			});
		}

		const fixture = TestBed.createComponent(TestSupportedComponent);
		fixture.detectChanges();
		const cmp = fixture.componentInstance;

		expect(cmp.wakeLock.isSupported()).toBe(true);
		expect(cmp.wakeLock.isActive()).toBe(false);

		await cmp.wakeLock.forceRequest('screen');
		fixture.detectChanges();

		expect(cmp.wakeLock.isActive()).toBe(true);

		await cmp.wakeLock.release();
		fixture.detectChanges();

		expect(cmp.wakeLock.isActive()).toBe(false);
	});

	it('should delay requesting if document is hidden', async () => {
		const mockNavigator = {} as Navigator;
		const sentinel = defineWakeLockAPI(mockNavigator);
		const mockDocument = new MockDocument();

		@Component({ standalone: true, template: '' })
		class TestDelayComponent {
			wakeLock = injectWakeLock({
				navigator: mockNavigator,
				document: mockDocument as any as Document,
			});
		}

		const fixture = TestBed.createComponent(TestDelayComponent);
		fixture.detectChanges();
		const cmp = fixture.componentInstance;

		await cmp.wakeLock.request('screen');

		expect(cmp.wakeLock.isActive()).toBe(false);
		expect(cmp.wakeLock.sentinel()).toBe(null);

		// Make document visible
		mockDocument.visibilityState = 'visible';
		mockDocument.dispatchEvent(new Event('visibilitychange'));
		fixture.detectChanges();

		// Wait for async operations
		await new Promise((resolve) => setTimeout(resolve, 100));
		fixture.detectChanges();

		expect(cmp.wakeLock.isActive()).toBe(true);
		expect(cmp.wakeLock.sentinel()).not.toBe(null);
	});

	it('should cancel requesting if released before document becomes visible', async () => {
		const mockNavigator = {} as Navigator;
		defineWakeLockAPI(mockNavigator);
		const mockDocument = new MockDocument();

		@Component({ standalone: true, template: '' })
		class TestCancelComponent {
			wakeLock = injectWakeLock({
				navigator: mockNavigator,
				document: mockDocument as any as Document,
			});
		}

		const fixture = TestBed.createComponent(TestCancelComponent);
		fixture.detectChanges();
		const cmp = fixture.componentInstance;

		await cmp.wakeLock.request('screen');

		expect(cmp.wakeLock.isActive()).toBe(false);

		await cmp.wakeLock.release();

		expect(cmp.wakeLock.isActive()).toBe(false);

		// Make document visible
		mockDocument.visibilityState = 'visible';
		mockDocument.dispatchEvent(new Event('visibilitychange'));
		fixture.detectChanges();

		// Wait for async operations
		await new Promise((resolve) => setTimeout(resolve, 100));
		fixture.detectChanges();

		expect(cmp.wakeLock.isActive()).toBe(false);
		expect(cmp.wakeLock.sentinel()).toBe(null);
	});

	it('should be inactive if wake lock is released for some reason', async () => {
		const mockNavigator = {} as Navigator;
		const mockAPI = defineWakeLockAPI(mockNavigator);
		const mockDocument = new MockDocument();
		mockDocument.visibilityState = 'visible';

		@Component({ standalone: true, template: '' })
		class TestReleaseComponent {
			wakeLock = injectWakeLock({
				navigator: mockNavigator,
				document: mockDocument as any as Document,
			});
		}

		const fixture = TestBed.createComponent(TestReleaseComponent);
		fixture.detectChanges();
		const cmp = fixture.componentInstance;

		await cmp.wakeLock.request('screen');
		fixture.detectChanges();

		expect(cmp.wakeLock.isActive()).toBe(true);

		// Simulate wake lock being released by system
		mockDocument.visibilityState = 'hidden';
		mockDocument.dispatchEvent(new Event('visibilitychange'));
		const currentSentinel = mockAPI.getCurrentSentinel();
		if (currentSentinel) {
			await currentSentinel.release();
		}
		fixture.detectChanges();

		// Wait for async operations
		await new Promise((resolve) => setTimeout(resolve, 100));
		fixture.detectChanges();

		expect(cmp.wakeLock.isActive()).toBe(false);

		// Make document visible again
		mockDocument.visibilityState = 'visible';
		mockDocument.dispatchEvent(new Event('visibilitychange'));
		fixture.detectChanges();

		// Wait for async operations
		await new Promise((resolve) => setTimeout(resolve, 100));
		fixture.detectChanges();

		// Should re-request wake lock
		expect(cmp.wakeLock.isActive()).toBe(true);
	});

	it('should handle request method with visible document', async () => {
		const mockNavigator = {} as Navigator;
		const sentinel = defineWakeLockAPI(mockNavigator);
		const mockDocument = {
			visibilityState: 'visible',
			addEventListener: jest.fn(),
			removeEventListener: jest.fn(),
		} as any;

		@Component({ standalone: true, template: '' })
		class TestRequestComponent {
			wakeLock = injectWakeLock({
				navigator: mockNavigator,
				document: mockDocument,
			});
		}

		const fixture = TestBed.createComponent(TestRequestComponent);
		fixture.detectChanges();
		const cmp = fixture.componentInstance;

		await cmp.wakeLock.request('screen');
		fixture.detectChanges();

		expect(cmp.wakeLock.isActive()).toBe(true);
		expect(cmp.wakeLock.sentinel()).not.toBe(null);
	});

	it('should handle errors in forceRequest', async () => {
		const mockNavigator = {
			wakeLock: {
				request: jest.fn().mockRejectedValue(new Error('Wake lock denied')),
			},
		} as any;

		const mockDocument = {
			visibilityState: 'visible',
			addEventListener: jest.fn(),
			removeEventListener: jest.fn(),
		} as any;

		@Component({ standalone: true, template: '' })
		class TestErrorComponent {
			wakeLock = injectWakeLock({
				navigator: mockNavigator,
				document: mockDocument,
			});
		}

		const fixture = TestBed.createComponent(TestErrorComponent);
		fixture.detectChanges();
		const cmp = fixture.componentInstance;

		await expect(cmp.wakeLock.forceRequest('screen')).rejects.toThrow(
			'Wake lock denied',
		);

		expect(cmp.wakeLock.sentinel()).toBe(null);
		expect(cmp.wakeLock.isActive()).toBe(false);
	});

	it('should return correct sentinel value', async () => {
		const mockNavigator = {} as Navigator;
		const mockAPI = defineWakeLockAPI(mockNavigator);
		const mockDocument = {
			visibilityState: 'visible',
			addEventListener: jest.fn(),
			removeEventListener: jest.fn(),
		} as any;

		@Component({ standalone: true, template: '' })
		class TestSentinelComponent {
			wakeLock = injectWakeLock({
				navigator: mockNavigator,
				document: mockDocument,
			});
		}

		const fixture = TestBed.createComponent(TestSentinelComponent);
		fixture.detectChanges();
		const cmp = fixture.componentInstance;

		expect(cmp.wakeLock.sentinel()).toBe(null);

		await cmp.wakeLock.forceRequest('screen');
		fixture.detectChanges();

		expect(cmp.wakeLock.sentinel()).toBe(mockAPI.getCurrentSentinel());
		expect(cmp.wakeLock.sentinel()).not.toBe(null);

		await cmp.wakeLock.release();
		fixture.detectChanges();

		expect(cmp.wakeLock.sentinel()).toBe(null);
	});

	it('should handle multiple release calls', async () => {
		const mockNavigator = {} as Navigator;
		defineWakeLockAPI(mockNavigator);
		const mockDocument = {
			visibilityState: 'visible',
			addEventListener: jest.fn(),
			removeEventListener: jest.fn(),
		} as any;

		@Component({ standalone: true, template: '' })
		class TestMultipleReleaseComponent {
			wakeLock = injectWakeLock({
				navigator: mockNavigator,
				document: mockDocument,
			});
		}

		const fixture = TestBed.createComponent(TestMultipleReleaseComponent);
		fixture.detectChanges();
		const cmp = fixture.componentInstance;

		await cmp.wakeLock.forceRequest('screen');
		fixture.detectChanges();

		expect(cmp.wakeLock.isActive()).toBe(true);

		await cmp.wakeLock.release();
		fixture.detectChanges();

		expect(cmp.wakeLock.isActive()).toBe(false);

		// Should not throw when releasing again
		await expect(cmp.wakeLock.release()).resolves.not.toThrow();
		fixture.detectChanges();
		expect(cmp.wakeLock.isActive()).toBe(false);
	});
});
