import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { injectElementVisibility } from './inject-element-visibility';

describe(injectElementVisibility.name, () => {
	@Component({
		standalone: true,
		template: `
			<div #target style="height: 100px; width: 100px;">Target Element</div>
			<div>Visibility: {{ isVisible() }}</div>
		`,
	})
	class TestComponent {
		targetElement = viewChild.required<ElementRef>('target');
		isVisible = signal(false);

		constructor() {
			// We'll set this up in tests
		}
	}

	function setup() {
		const fixture = TestBed.createComponent(TestComponent);
		fixture.detectChanges();
		return fixture.componentInstance;
	}

	it('should create with initial value false by default', () => {
		@Component({
			standalone: true,
			template: `
				<div>Test</div>
			`,
		})
		class Test {
			visibility = injectElementVisibility({
				element: document.createElement('div'),
			});
		}

		const fixture = TestBed.createComponent(Test);
		fixture.detectChanges();
		const cmp = fixture.componentInstance;

		expect(cmp.visibility()).toBe(false);
	});

	it('should allow setting initial value to true', () => {
		@Component({
			standalone: true,
			template: `
				<div>Test</div>
			`,
		})
		class Test {
			visibility = injectElementVisibility({
				element: document.createElement('div'),
				initialValue: true,
			});
		}

		const fixture = TestBed.createComponent(Test);
		fixture.detectChanges();
		const cmp = fixture.componentInstance;

		expect(cmp.visibility()).toBe(true);
	});

	it('should return false when element is null', () => {
		@Component({
			standalone: true,
			template: `
				<div>Test</div>
			`,
		})
		class Test {
			visibility = injectElementVisibility({
				element: null as any,
			});
		}

		const fixture = TestBed.createComponent(Test);
		fixture.detectChanges();
		const cmp = fixture.componentInstance;

		expect(cmp.visibility()).toBe(false);
	});

	it('should return false when window is null', () => {
		@Component({
			standalone: true,
			template: `
				<div>Test</div>
			`,
		})
		class Test {
			visibility = injectElementVisibility({
				element: document.createElement('div'),
				window: null as any,
			});
		}

		const fixture = TestBed.createComponent(Test);
		fixture.detectChanges();
		const cmp = fixture.componentInstance;

		expect(cmp.visibility()).toBe(false);
	});

	it('should work with ElementRef', () => {
		@Component({
			standalone: true,
			template: `
				<div #element>Test</div>
			`,
		})
		class Test {
			elementRef = viewChild.required<ElementRef>('element');
			visibility = injectElementVisibility({
				element: this.elementRef().nativeElement,
			});
		}

		const fixture = TestBed.createComponent(Test);
		fixture.detectChanges();
		const cmp = fixture.componentInstance;

		// Should not throw and should have a boolean value
		expect(typeof cmp.visibility()).toBe('boolean');
	});

	it('should accept threshold option', () => {
		@Component({
			standalone: true,
			template: `
				<div>Test</div>
			`,
		})
		class Test {
			visibility = injectElementVisibility({
				element: document.createElement('div'),
				threshold: 0.5,
			});
		}

		const fixture = TestBed.createComponent(Test);
		fixture.detectChanges();
		const cmp = fixture.componentInstance;

		// Should not throw
		expect(typeof cmp.visibility()).toBe('boolean');
	});

	it('should accept threshold as array', () => {
		@Component({
			standalone: true,
			template: `
				<div>Test</div>
			`,
		})
		class Test {
			visibility = injectElementVisibility({
				element: document.createElement('div'),
				threshold: [0, 0.25, 0.5, 0.75, 1],
			});
		}

		const fixture = TestBed.createComponent(Test);
		fixture.detectChanges();
		const cmp = fixture.componentInstance;

		// Should not throw
		expect(typeof cmp.visibility()).toBe('boolean');
	});

	it('should accept rootMargin option', () => {
		@Component({
			standalone: true,
			template: `
				<div>Test</div>
			`,
		})
		class Test {
			visibility = injectElementVisibility({
				element: document.createElement('div'),
				rootMargin: '10px',
			});
		}

		const fixture = TestBed.createComponent(Test);
		fixture.detectChanges();
		const cmp = fixture.componentInstance;

		// Should not throw
		expect(typeof cmp.visibility()).toBe('boolean');
	});

	it('should accept scrollTarget option', () => {
		const scrollContainer = document.createElement('div');

		@Component({
			standalone: true,
			template: `
				<div>Test</div>
			`,
		})
		class Test {
			visibility = injectElementVisibility({
				element: document.createElement('div'),
				scrollTarget: scrollContainer,
			});
		}

		const fixture = TestBed.createComponent(Test);
		fixture.detectChanges();
		const cmp = fixture.componentInstance;

		// Should not throw
		expect(typeof cmp.visibility()).toBe('boolean');
	});

	it('should work with once option', () => {
		@Component({
			standalone: true,
			template: `
				<div>Test</div>
			`,
		})
		class Test {
			visibility = injectElementVisibility({
				element: document.createElement('div'),
				once: true,
			});
		}

		const fixture = TestBed.createComponent(Test);
		fixture.detectChanges();
		const cmp = fixture.componentInstance;

		// Should not throw
		expect(typeof cmp.visibility()).toBe('boolean');
	});

	it('should inject ElementRef when no element is provided', () => {
		@Component({
			standalone: true,
			template: `
				<div>Test</div>
			`,
		})
		class Test {
			visibility = injectElementVisibility();
		}

		const fixture = TestBed.createComponent(Test);
		fixture.detectChanges();
		const cmp = fixture.componentInstance;

		// Should not throw and should return a signal
		expect(typeof cmp.visibility()).toBe('boolean');
	});
});
