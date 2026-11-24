import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgxResize, type ResizeOptions, type ResizeResult } from './resize';

class MockResizeObserver {
	static instances: MockResizeObserver[] = [];

	constructor(private callback: ResizeObserverCallback) {
		MockResizeObserver.instances.push(this);
	}

	observe = jest.fn();
	unobserve = jest.fn();
	disconnect = jest.fn();

	trigger() {
		this.callback([], this as unknown as ResizeObserver);
	}
}

@Component({
	standalone: true,
	imports: [NgxResize],
	template: `
		<div [ngxResizeOptions]="options" (ngxResize)="results.push($event)"></div>
	`,
})
class TestHost {
	options: Partial<ResizeOptions> = {};
	results: ResizeResult[] = [];
}

describe(NgxResize.name, () => {
	const originalResizeObserver = window.ResizeObserver;

	beforeEach(() => {
		jest.useFakeTimers();
		MockResizeObserver.instances = [];
		window.ResizeObserver =
			MockResizeObserver as unknown as typeof ResizeObserver;
	});

	afterEach(() => {
		jest.useRealTimers();
		window.ResizeObserver = originalResizeObserver;
	});

	function setup(options: Partial<ResizeOptions>) {
		const fixture = TestBed.createComponent(TestHost);
		fixture.componentInstance.options = options;
		fixture.detectChanges();
		return fixture.componentInstance;
	}

	it('emits window resize events without delay when the resize debounce is 0', () => {
		const host = setup({ debounce: { scroll: 50, resize: 0 } });

		window.dispatchEvent(new Event('resize'));

		expect(host.results.length).toBe(1);
	});

	it('debounces window resize events with the resize value only', () => {
		const host = setup({ debounce: { scroll: 50, resize: 100 } });

		window.dispatchEvent(new Event('resize'));
		jest.advanceTimersByTime(99);
		expect(host.results.length).toBe(0);

		jest.advanceTimersByTime(1);
		expect(host.results.length).toBe(1);
	});

	it('debounces scroll events with the scroll value only', () => {
		const host = setup({ scroll: true, debounce: { scroll: 50, resize: 0 } });

		window.dispatchEvent(new Event('scroll'));
		jest.advanceTimersByTime(49);
		expect(host.results.length).toBe(0);

		jest.advanceTimersByTime(1);
		expect(host.results.length).toBe(1);
	});

	it('debounces ResizeObserver callbacks with the scroll value', () => {
		const host = setup({ debounce: { scroll: 50, resize: 0 } });

		MockResizeObserver.instances[0].trigger();
		MockResizeObserver.instances[0].trigger();
		jest.advanceTimersByTime(49);
		expect(host.results.length).toBe(0);

		jest.advanceTimersByTime(1);
		expect(host.results.length).toBe(1);
	});

	it('emits every event without delay when debounce is 0', () => {
		const host = setup({ scroll: true, debounce: 0 });

		MockResizeObserver.instances[0].trigger();
		window.dispatchEvent(new Event('resize'));
		window.dispatchEvent(new Event('scroll'));

		expect(host.results.length).toBe(3);
	});

	it('emits the initial result immediately when emitInitialResult is set and debounce is 0', () => {
		const host = setup({ emitInitialResult: true, debounce: 0 });

		expect(host.results.length).toBe(1);
	});
});
