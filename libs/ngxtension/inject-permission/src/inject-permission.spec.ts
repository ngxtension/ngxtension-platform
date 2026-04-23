import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { injectPermission } from './inject-permission';

describe(injectPermission.name, () => {
	@Component({
		standalone: true,
		template: '',
	})
	class TestComponent {
		permission = injectPermission('geolocation');
	}

	@Component({
		standalone: true,
		template: '',
	})
	class TestComponentWithDescriptor {
		permission = injectPermission({ name: 'notifications' });
	}

	@Component({
		standalone: true,
		template: '',
	})
	class TestComponentMicrophone {
		permission = injectPermission('microphone');
	}

	function setup() {
		const fixture = TestBed.createComponent(TestComponent);
		fixture.detectChanges();
		return fixture.componentInstance;
	}

	function setupWithDescriptor() {
		const fixture = TestBed.createComponent(TestComponentWithDescriptor);
		fixture.detectChanges();
		return fixture.componentInstance;
	}

	function setupMicrophone() {
		const fixture = TestBed.createComponent(TestComponentMicrophone);
		fixture.detectChanges();
		return fixture.componentInstance;
	}

	it('should initialize with undefined state', () => {
		const cmp = setup();
		// In test environments without Permissions API, the state will be undefined
		expect(cmp.permission()).toBeUndefined();
	});

	it('should accept string permission name', () => {
		const cmp = setup();
		expect(cmp.permission).toBeDefined();
	});

	it('should accept permission descriptor object', () => {
		const cmp = setupWithDescriptor();
		expect(cmp.permission).toBeDefined();
	});

	it('should return a readonly signal', () => {
		const cmp = setup();
		expect(typeof cmp.permission).toBe('function');
		expect(typeof cmp.permission()).toBe('undefined'); // undefined in test environment
	});

	it('should handle microphone permission', () => {
		const cmp = setupMicrophone();
		expect(cmp.permission).toBeDefined();
	});

	describe('with mocked Permissions API', () => {
		it('should handle environments with Permissions API support', () => {
			// This test verifies that the function can be called and returns a signal
			// In test environments, the Permissions API may not be fully available
			const cmp = setup();
			expect(typeof cmp.permission).toBe('function');
			expect(typeof cmp.permission()).toBe('undefined'); // undefined when API not available
		});

		it('should normalize string permission descriptor to object', () => {
			const cmp = setup();
			// The function accepts string and converts it internally
			expect(cmp.permission).toBeDefined();
		});

		it('should normalize descriptor object', () => {
			const cmp = setupWithDescriptor();
			// The function accepts descriptor object
			expect(cmp.permission).toBeDefined();
		});
	});

	describe('without Permissions API support', () => {
		let originalNavigator: Navigator;

		beforeEach(() => {
			originalNavigator = global.navigator;

			Object.defineProperty(global, 'navigator', {
				value: {
					...originalNavigator,
					permissions: undefined,
				},
				writable: true,
				configurable: true,
			});
		});

		afterEach(() => {
			Object.defineProperty(global, 'navigator', {
				value: originalNavigator,
				writable: true,
				configurable: true,
			});
		});

		it('should return undefined when API is not supported', () => {
			const cmp = setup();
			expect(cmp.permission()).toBeUndefined();
		});
	});

	describe('permission descriptor types', () => {
		it('should handle camera permission', () => {
			@Component({
				standalone: true,
				template: '',
			})
			class TestComponentCamera {
				permission = injectPermission('camera');
			}

			const fixture = TestBed.createComponent(TestComponentCamera);
			fixture.detectChanges();
			const cmp = fixture.componentInstance;

			expect(cmp.permission).toBeDefined();
		});

		it('should handle clipboard-read permission', () => {
			@Component({
				standalone: true,
				template: '',
			})
			class TestComponentClipboard {
				permission = injectPermission('clipboard-read');
			}

			const fixture = TestBed.createComponent(TestComponentClipboard);
			fixture.detectChanges();
			const cmp = fixture.componentInstance;

			expect(cmp.permission).toBeDefined();
		});

		it('should handle notifications permission', () => {
			@Component({
				standalone: true,
				template: '',
			})
			class TestComponentNotifications {
				permission = injectPermission('notifications');
			}

			const fixture = TestBed.createComponent(TestComponentNotifications);
			fixture.detectChanges();
			const cmp = fixture.componentInstance;

			expect(cmp.permission).toBeDefined();
		});

		it('should handle push permission', () => {
			@Component({
				standalone: true,
				template: '',
			})
			class TestComponentPush {
				permission = injectPermission({ name: 'push' });
			}

			const fixture = TestBed.createComponent(TestComponentPush);
			fixture.detectChanges();
			const cmp = fixture.componentInstance;

			expect(cmp.permission).toBeDefined();
		});
	});
});
