import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { injectBluetooth } from './inject-bluetooth';

describe(injectBluetooth.name, () => {
	@Component({
		standalone: true,
		template: `
			<div data-testid="supported">{{ bluetooth.supported() }}</div>
			<div data-testid="connected">{{ bluetooth.isConnected() }}</div>
			<div data-testid="device">{{ bluetooth.device()?.name || 'none' }}</div>
			<div data-testid="error">{{ bluetooth.error() || 'none' }}</div>
		`,
	})
	class TestComponent {
		bluetooth = injectBluetooth();
	}

	function setup() {
		const fixture = TestBed.createComponent(TestComponent);
		fixture.detectChanges();
		return fixture.componentInstance;
	}

	it('should initialize with default values', () => {
		const cmp = setup();
		expect(cmp.bluetooth.isConnected()).toBe(false);
		expect(cmp.bluetooth.device()).toBeUndefined();
		expect(cmp.bluetooth.server()).toBeUndefined();
		expect(cmp.bluetooth.error()).toBeNull();
	});

	it('should detect bluetooth support', () => {
		const cmp = setup();
		const hasBluetoothApi = 'bluetooth' in navigator;
		expect(cmp.bluetooth.supported()).toBe(hasBluetoothApi);
	});

	it('should handle acceptAllDevices option', () => {
		@Component({
			standalone: true,
			template: '',
		})
		class TestAcceptAllComponent {
			bluetooth = injectBluetooth({ acceptAllDevices: true });
		}

		const fixture = TestBed.createComponent(TestAcceptAllComponent);
		const cmp = fixture.componentInstance;
		expect(cmp.bluetooth).toBeDefined();
	});

	it('should handle filters option', () => {
		@Component({
			standalone: true,
			template: '',
		})
		class TestFiltersComponent {
			bluetooth = injectBluetooth({
				filters: [{ services: ['battery_service'] }],
			});
		}

		const fixture = TestBed.createComponent(TestFiltersComponent);
		const cmp = fixture.componentInstance;
		expect(cmp.bluetooth).toBeDefined();
	});

	it('should handle optionalServices option', () => {
		@Component({
			standalone: true,
			template: '',
		})
		class TestOptionalServicesComponent {
			bluetooth = injectBluetooth({
				optionalServices: ['battery_service', 'heart_rate'],
			});
		}

		const fixture = TestBed.createComponent(TestOptionalServicesComponent);
		const cmp = fixture.componentInstance;
		expect(cmp.bluetooth).toBeDefined();
	});

	it('should expose requestDevice function', () => {
		const cmp = setup();
		expect(typeof cmp.bluetooth.requestDevice).toBe('function');
	});

	it('should return readonly signals', () => {
		const cmp = setup();
		expect(() => {
			// @ts-expect-error - Testing runtime readonly
			cmp.bluetooth.isConnected.set(true);
		}).toThrow();
	});
});
