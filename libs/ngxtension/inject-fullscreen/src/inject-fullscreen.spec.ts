import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { injectFullscreen } from './inject-fullscreen';

describe(injectFullscreen.name, () => {
	@Component({ standalone: true, template: '' })
	class TestComponent {
		fullscreen = injectFullscreen();
	}

	function setup() {
		const fixture = TestBed.createComponent(TestComponent);
		fixture.detectChanges();
		return fixture.componentInstance;
	}

	beforeEach(() => {
		// Mock fullscreen API
		Object.defineProperty(document, 'fullscreenElement', {
			writable: true,
			configurable: true,
			value: null,
		});

		Object.defineProperty(document, 'fullscreenEnabled', {
			writable: true,
			configurable: true,
			value: true,
		});
	});

	it('should create fullscreen instance', () => {
		const cmp = setup();
		expect(cmp.fullscreen).toBeDefined();
		expect(cmp.fullscreen.isFullscreen).toBeDefined();
		expect(cmp.fullscreen.enter).toBeDefined();
		expect(cmp.fullscreen.exit).toBeDefined();
		expect(cmp.fullscreen.toggle).toBeDefined();
		expect(cmp.fullscreen.isSupported).toBeDefined();
	});

	it('should detect fullscreen support', () => {
		// Mock requestFullscreen on document element
		document.documentElement.requestFullscreen = jest.fn();

		// Mock exitFullscreen on document
		(document as any).exitFullscreen = jest.fn();

		// Add fullScreen property
		Object.defineProperty(document, 'fullScreen', {
			writable: true,
			configurable: true,
			value: false,
		});

		const cmp = setup();
		expect(cmp.fullscreen.isSupported()).toBe(true);
	});

	it('should initially not be in fullscreen', () => {
		const cmp = setup();
		expect(cmp.fullscreen.isFullscreen()).toBe(false);
	});

	it('should handle fullscreen change events', () => {
		// Setup mocks
		document.documentElement.requestFullscreen = jest
			.fn()
			.mockResolvedValue(undefined);
		(document as any).exitFullscreen = jest.fn().mockResolvedValue(undefined);
		Object.defineProperty(document, 'fullScreen', {
			writable: true,
			configurable: true,
			value: false,
		});

		const cmp = setup();

		// Simulate entering fullscreen
		Object.defineProperty(document, 'fullscreenElement', {
			writable: true,
			configurable: true,
			value: document.documentElement,
		});

		Object.defineProperty(document, 'fullScreen', {
			writable: true,
			configurable: true,
			value: true,
		});

		const event = new Event('fullscreenchange');
		document.dispatchEvent(event);

		expect(cmp.fullscreen.isFullscreen()).toBe(true);

		// Simulate exiting fullscreen
		Object.defineProperty(document, 'fullscreenElement', {
			writable: true,
			configurable: true,
			value: null,
		});

		Object.defineProperty(document, 'fullScreen', {
			writable: true,
			configurable: true,
			value: false,
		});

		document.dispatchEvent(event);
		expect(cmp.fullscreen.isFullscreen()).toBe(false);
	});

	it('should handle enter method', async () => {
		const mockRequestFullscreen = jest.fn().mockResolvedValue(undefined);
		document.documentElement.requestFullscreen = mockRequestFullscreen;

		(document as any).exitFullscreen = jest.fn().mockResolvedValue(undefined);
		Object.defineProperty(document, 'fullScreen', {
			writable: true,
			configurable: true,
			value: false,
		});

		const cmp = setup();

		await cmp.fullscreen.enter();

		expect(mockRequestFullscreen).toHaveBeenCalled();
	});

	it('should handle exit method', async () => {
		const mockExitFullscreen = jest.fn().mockResolvedValue(undefined);
		const mockRequestFullscreen = jest.fn().mockResolvedValue(undefined);
		document.documentElement.requestFullscreen = mockRequestFullscreen;
		(document as any).exitFullscreen = mockExitFullscreen;

		Object.defineProperty(document, 'fullScreen', {
			writable: true,
			configurable: true,
			value: false,
		});

		const cmp = setup();

		// Enter fullscreen first
		await cmp.fullscreen.enter();

		// Simulate fullscreen state change
		Object.defineProperty(document, 'fullScreen', {
			writable: true,
			configurable: true,
			value: true,
		});

		Object.defineProperty(document, 'fullscreenElement', {
			writable: true,
			configurable: true,
			value: document.documentElement,
		});

		// Now exit fullscreen
		await cmp.fullscreen.exit();

		expect(mockExitFullscreen).toHaveBeenCalled();
	});

	it('should handle toggle method', async () => {
		const mockRequestFullscreen = jest.fn().mockResolvedValue(undefined);
		const mockExitFullscreen = jest.fn().mockResolvedValue(undefined);

		document.documentElement.requestFullscreen = mockRequestFullscreen;
		(document as any).exitFullscreen = mockExitFullscreen;

		Object.defineProperty(document, 'fullScreen', {
			writable: true,
			configurable: true,
			value: false,
		});

		const cmp = setup();

		// Toggle to enter fullscreen
		await cmp.fullscreen.toggle();
		expect(mockRequestFullscreen).toHaveBeenCalled();

		// Simulate fullscreen state change
		Object.defineProperty(document, 'fullScreen', {
			writable: true,
			configurable: true,
			value: true,
		});

		Object.defineProperty(document, 'fullscreenElement', {
			writable: true,
			configurable: true,
			value: document.documentElement,
		});

		// Toggle to exit fullscreen
		await cmp.fullscreen.toggle();
		expect(mockExitFullscreen).toHaveBeenCalled();
	});

	it('should work with custom target element', () => {
		const videoElement = document.createElement('video');
		videoElement.requestFullscreen = jest.fn();

		@Component({ standalone: true, template: '' })
		class TestWithTarget {
			videoEl = signal(videoElement);
			fullscreen = injectFullscreen({
				target: this.videoEl(),
			});
		}

		const fixture = TestBed.createComponent(TestWithTarget);
		fixture.detectChanges();
		const cmp = fixture.componentInstance;

		expect(cmp.fullscreen).toBeDefined();
	});

	it('should handle autoExit option', async () => {
		const mockExitFullscreen = jest.fn().mockResolvedValue(undefined);
		const mockRequestFullscreen = jest.fn().mockResolvedValue(undefined);
		document.documentElement.requestFullscreen = mockRequestFullscreen;
		(document as any).exitFullscreen = mockExitFullscreen;

		Object.defineProperty(document, 'fullScreen', {
			writable: true,
			configurable: true,
			value: false,
		});

		@Component({ standalone: true, template: '' })
		class TestWithAutoExit {
			fullscreen = injectFullscreen({ autoExit: true });
		}

		const fixture = TestBed.createComponent(TestWithAutoExit);
		fixture.detectChanges();

		// Enter fullscreen
		await fixture.componentInstance.fullscreen.enter();

		// Simulate fullscreen state change
		Object.defineProperty(document, 'fullScreen', {
			writable: true,
			configurable: true,
			value: true,
		});

		Object.defineProperty(document, 'fullscreenElement', {
			writable: true,
			configurable: true,
			value: document.documentElement,
		});

		// Destroy component
		fixture.destroy();

		// Wait for async operations
		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(mockExitFullscreen).toHaveBeenCalled();
	});

	it('should not enter fullscreen if already in fullscreen', async () => {
		const mockRequestFullscreen = jest.fn().mockResolvedValue(undefined);
		document.documentElement.requestFullscreen = mockRequestFullscreen;

		(document as any).exitFullscreen = jest.fn().mockResolvedValue(undefined);
		Object.defineProperty(document, 'fullScreen', {
			writable: true,
			configurable: true,
			value: false,
		});

		const cmp = setup();

		// Enter fullscreen first time
		await cmp.fullscreen.enter();
		expect(mockRequestFullscreen).toHaveBeenCalledTimes(1);

		// Simulate fullscreen state change
		Object.defineProperty(document, 'fullScreen', {
			writable: true,
			configurable: true,
			value: true,
		});

		Object.defineProperty(document, 'fullscreenElement', {
			writable: true,
			configurable: true,
			value: document.documentElement,
		});

		// Try to enter fullscreen again
		await cmp.fullscreen.enter();

		// Should not call requestFullscreen again when already in fullscreen
		expect(mockRequestFullscreen).toHaveBeenCalledTimes(1);
	});

	it('should not exit fullscreen if not in fullscreen', async () => {
		const mockExitFullscreen = jest.fn().mockResolvedValue(undefined);
		document.documentElement.requestFullscreen = jest
			.fn()
			.mockResolvedValue(undefined);
		(document as any).exitFullscreen = mockExitFullscreen;

		Object.defineProperty(document, 'fullScreen', {
			writable: true,
			configurable: true,
			value: false,
		});

		const cmp = setup();

		await cmp.fullscreen.exit();

		// Should not call exitFullscreen when not in fullscreen
		expect(mockExitFullscreen).not.toHaveBeenCalled();
	});
});
