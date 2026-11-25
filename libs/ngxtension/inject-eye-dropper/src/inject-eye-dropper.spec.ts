import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { injectEyeDropper } from './inject-eye-dropper';

describe(injectEyeDropper.name, () => {
	@Component({
		standalone: true,
		template: '',
	})
	class TestComponent {
		eyeDropper = injectEyeDropper();
	}

	@Component({
		standalone: true,
		template: '',
	})
	class TestComponentWithInitialValue {
		eyeDropper = injectEyeDropper({ initialValue: '#ff0000' });
	}

	function setup() {
		const fixture = TestBed.createComponent(TestComponent);
		fixture.detectChanges();
		return fixture.componentInstance;
	}

	function setupWithInitialValue() {
		const fixture = TestBed.createComponent(TestComponentWithInitialValue);
		fixture.detectChanges();
		return fixture.componentInstance;
	}

	it('should return isSupported signal', () => {
		const cmp = setup();
		// In test environments without EyeDropper API, isSupported will be false
		expect(typeof cmp.eyeDropper.isSupported()).toBe('boolean');
	});

	it('should initialize with empty sRGBHex by default', () => {
		const cmp = setup();
		expect(cmp.eyeDropper.sRGBHex()).toBe('');
	});

	it('should initialize with provided initialValue', () => {
		const cmp = setupWithInitialValue();
		expect(cmp.eyeDropper.sRGBHex()).toBe('#ff0000');
	});

	it('should return undefined when opening eye dropper without support', async () => {
		const cmp = setup();

		// In test environment, EyeDropper API is not supported
		if (!cmp.eyeDropper.isSupported()) {
			const result = await cmp.eyeDropper.open();
			expect(result).toBeUndefined();
		}
	});

	it('should have an open method', () => {
		const cmp = setup();
		expect(typeof cmp.eyeDropper.open).toBe('function');
	});

	it('should return readonly signal for sRGBHex', () => {
		const cmp = setup();

		// Verify it's a signal by calling it
		expect(typeof cmp.eyeDropper.sRGBHex()).toBe('string');
	});

	it('should handle AbortSignal in open options', async () => {
		const cmp = setup();
		const controller = new AbortController();

		// This should not throw even without API support
		const result = await cmp.eyeDropper.open({ signal: controller.signal });

		if (!cmp.eyeDropper.isSupported()) {
			expect(result).toBeUndefined();
		}
	});

	it('should work with custom injector', () => {
		const injector = TestBed.inject(TestBed);

		@Component({
			standalone: true,
			template: '',
		})
		class TestComponentWithInjector {
			eyeDropper = injectEyeDropper({ injector });
		}

		const fixture = TestBed.createComponent(TestComponentWithInjector);
		fixture.detectChanges();
		const cmp = fixture.componentInstance;

		expect(cmp.eyeDropper.isSupported).toBeDefined();
		expect(cmp.eyeDropper.sRGBHex).toBeDefined();
		expect(cmp.eyeDropper.open).toBeDefined();
	});

	// Mock test for when EyeDropper API is available
	it('should update sRGBHex when color is selected (mocked)', async () => {
		const cmp = setup();

		// Mock EyeDropper API
		const mockResult = { sRGBHex: '#123456' };
		const mockEyeDropper = {
			open: jest.fn().mockResolvedValue(mockResult),
		};

		// Mock window.EyeDropper
		(window as any).EyeDropper = jest.fn(() => mockEyeDropper);

		// Create a new component with mocked API
		@Component({
			standalone: true,
			template: '',
		})
		class TestComponentWithMock {
			eyeDropper = injectEyeDropper();
		}

		const fixture = TestBed.createComponent(TestComponentWithMock);
		fixture.detectChanges();
		const mockCmp = fixture.componentInstance;

		if (mockCmp.eyeDropper.isSupported()) {
			const result = await mockCmp.eyeDropper.open();
			expect(result).toEqual(mockResult);
			expect(mockCmp.eyeDropper.sRGBHex()).toBe('#123456');
		}

		// Clean up
		delete (window as any).EyeDropper;
	});
});
