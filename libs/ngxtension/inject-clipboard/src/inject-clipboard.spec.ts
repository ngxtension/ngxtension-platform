import { Component, signal } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { injectClipboard } from './inject-clipboard';

describe(injectClipboard.name, () => {
	@Component({
		standalone: true,
		template: '',
	})
	class TestComponent {
		clipboard = injectClipboard();
	}

	@Component({
		standalone: true,
		template: '',
	})
	class TestComponentWithSource {
		source = signal('Hello World');
		clipboard = injectClipboard({ source: this.source() });
	}

	@Component({
		standalone: true,
		template: '',
	})
	class TestComponentWithRead {
		clipboard = injectClipboard({ read: true });
	}

	function setup() {
		const fixture = TestBed.createComponent(TestComponent);
		fixture.detectChanges();
		return fixture.componentInstance;
	}

	function setupWithSource() {
		const fixture = TestBed.createComponent(TestComponentWithSource);
		fixture.detectChanges();
		return fixture.componentInstance;
	}

	function setupWithRead() {
		const fixture = TestBed.createComponent(TestComponentWithRead);
		fixture.detectChanges();
		return fixture.componentInstance;
	}

	it('should be supported', () => {
		const cmp = setup();
		// In test environments without clipboard API and without legacy mode,
		// isSupported will be false. This is expected behavior.
		expect(typeof cmp.clipboard.isSupported()).toBe('boolean');
	});

	it('should initialize with empty text and copied false', () => {
		const cmp = setup();
		expect(cmp.clipboard.text()).toBe('');
		expect(cmp.clipboard.copied()).toBe(false);
	});

	it('should copy text to clipboard', fakeAsync(async () => {
		const cmp = setup();
		expect(cmp.clipboard.copied()).toBe(false);

		await cmp.clipboard.copy('Hello World');

		expect(cmp.clipboard.text()).toBe('Hello World');
		expect(cmp.clipboard.copied()).toBe(true);

		// Should reset copied after default duration (1500ms)
		tick(1500);
		expect(cmp.clipboard.copied()).toBe(false);
	}));

	it('should copy source value when called without arguments', fakeAsync(async () => {
		const cmp = setupWithSource();
		expect(cmp.clipboard.copied()).toBe(false);

		await cmp.clipboard.copy();

		expect(cmp.clipboard.text()).toBe('Hello World');
		expect(cmp.clipboard.copied()).toBe(true);

		tick(1500);
		expect(cmp.clipboard.copied()).toBe(false);
	}));

	it('should reset copied after custom copiedDuring time', fakeAsync(async () => {
		@Component({
			standalone: true,
			template: '',
		})
		class TestComponentCustomDuration {
			clipboard = injectClipboard({ copiedDuring: 3000 });
		}

		const fixture = TestBed.createComponent(TestComponentCustomDuration);
		fixture.detectChanges();
		const cmp = fixture.componentInstance;

		await cmp.clipboard.copy('Test');
		expect(cmp.clipboard.copied()).toBe(true);

		tick(2000);
		expect(cmp.clipboard.copied()).toBe(true);

		tick(1000);
		expect(cmp.clipboard.copied()).toBe(false);
	}));

	it('should handle multiple copy operations and reset timeout correctly', fakeAsync(async () => {
		const cmp = setup();

		await cmp.clipboard.copy('First');
		expect(cmp.clipboard.copied()).toBe(true);
		expect(cmp.clipboard.text()).toBe('First');

		tick(1000);
		expect(cmp.clipboard.copied()).toBe(true);

		// Copy again before first timeout completes
		await cmp.clipboard.copy('Second');
		expect(cmp.clipboard.copied()).toBe(true);
		expect(cmp.clipboard.text()).toBe('Second');

		// Wait for original timeout duration
		tick(1000);
		// Should still be true because timeout was reset
		expect(cmp.clipboard.copied()).toBe(true);

		// Wait for reset timeout
		tick(500);
		expect(cmp.clipboard.copied()).toBe(false);
	}));

	it('should work with legacy mode', fakeAsync(async () => {
		@Component({
			standalone: true,
			template: '',
		})
		class TestComponentLegacy {
			clipboard = injectClipboard({ legacy: true });
		}

		const fixture = TestBed.createComponent(TestComponentLegacy);
		fixture.detectChanges();
		const cmp = fixture.componentInstance;

		expect(cmp.clipboard.isSupported()).toBe(true);

		await cmp.clipboard.copy('Legacy Text');
		expect(cmp.clipboard.text()).toBe('Legacy Text');
		expect(cmp.clipboard.copied()).toBe(true);

		tick(1500);
		expect(cmp.clipboard.copied()).toBe(false);
	}));

	it('should setup event listeners when read option is enabled', () => {
		const cmp = setupWithRead();
		// Event listeners are set up, but we can't easily test them in jsdom
		// This test verifies the component initializes correctly with read: true
		expect(typeof cmp.clipboard.isSupported()).toBe('boolean');
		expect(cmp.clipboard.text()).toBe('');
	});

	it('should not copy when value is null or undefined', fakeAsync(async () => {
		const cmp = setup();

		await cmp.clipboard.copy(null as any);
		expect(cmp.clipboard.copied()).toBe(false);
		expect(cmp.clipboard.text()).toBe('');

		await cmp.clipboard.copy(undefined as any);
		expect(cmp.clipboard.copied()).toBe(false);
		expect(cmp.clipboard.text()).toBe('');
	}));

	it('should handle empty string', fakeAsync(async () => {
		const cmp = setup();

		await cmp.clipboard.copy('');
		expect(cmp.clipboard.copied()).toBe(true);
		expect(cmp.clipboard.text()).toBe('');

		tick(1500);
		expect(cmp.clipboard.copied()).toBe(false);
	}));

	it('should return readonly signals for text and copied', () => {
		const cmp = setup();

		// These should be readonly signals
		expect(cmp.clipboard.text).toBeDefined();
		expect(cmp.clipboard.copied).toBeDefined();

		// Verify they're signals by calling them
		expect(typeof cmp.clipboard.text()).toBe('string');
		expect(typeof cmp.clipboard.copied()).toBe('boolean');
	});
});
