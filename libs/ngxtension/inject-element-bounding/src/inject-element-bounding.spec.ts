import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { injectElementBounding } from './inject-element-bounding';

describe(injectElementBounding.name, () => {
	@Component({
		standalone: true,
		template: `
			<div
				#target
				style="width: 200px; height: 100px; position: absolute; top: 50px; left: 50px;"
			>
				Target Element
			</div>
			<div>
				Width: {{ bounding.width() }} Height: {{ bounding.height() }} Top:
				{{ bounding.top() }} Left: {{ bounding.left() }} Right:
				{{ bounding.right() }} Bottom: {{ bounding.bottom() }} X:
				{{ bounding.x() }} Y: {{ bounding.y() }}
			</div>
		`,
	})
	class Test {
		target = viewChild<ElementRef<HTMLDivElement>>('target');
		bounding = injectElementBounding(this.target);
	}

	function setup() {
		const fixture = TestBed.createComponent(Test);
		fixture.detectChanges();
		return fixture;
	}

	it('should initialize with zero values before element is rendered', () => {
		@Component({
			standalone: true,
			template: ``,
		})
		class EmptyTest {
			target = signal<ElementRef<HTMLElement> | null>(null);
			bounding = injectElementBounding(this.target);
		}

		const fixture = TestBed.createComponent(EmptyTest);
		fixture.detectChanges();
		const cmp = fixture.componentInstance;

		expect(cmp.bounding.width()).toBe(0);
		expect(cmp.bounding.height()).toBe(0);
		expect(cmp.bounding.top()).toBe(0);
		expect(cmp.bounding.left()).toBe(0);
		expect(cmp.bounding.right()).toBe(0);
		expect(cmp.bounding.bottom()).toBe(0);
		expect(cmp.bounding.x()).toBe(0);
		expect(cmp.bounding.y()).toBe(0);
	});

	it('should calculate bounding box values', (done) => {
		const fixture = setup();
		const cmp = fixture.componentInstance;

		// Wait for afterNextRender to complete
		setTimeout(() => {
			fixture.detectChanges();

			// The element should have dimensions
			expect(cmp.bounding.width()).toBe(200);
			expect(cmp.bounding.height()).toBe(100);
			expect(cmp.bounding.left()).toBeGreaterThanOrEqual(50);
			expect(cmp.bounding.top()).toBeGreaterThanOrEqual(50);
			done();
		}, 100);
	});

	it('should update bounding box when element is resized', (done) => {
		const fixture = setup();
		const cmp = fixture.componentInstance;

		setTimeout(() => {
			fixture.detectChanges();
			const initialWidth = cmp.bounding.width();
			expect(initialWidth).toBe(200);

			// Resize the element
			const element = cmp.target()?.nativeElement;
			if (element) {
				element.style.width = '300px';
			}

			// Wait for ResizeObserver to trigger
			setTimeout(() => {
				fixture.detectChanges();
				expect(cmp.bounding.width()).toBe(300);
				done();
			}, 100);
		}, 100);
	});

	it('should provide an update function', (done) => {
		const fixture = setup();
		const cmp = fixture.componentInstance;

		setTimeout(() => {
			fixture.detectChanges();
			expect(cmp.bounding.width()).toBe(200);

			// Change element size
			const element = cmp.target()?.nativeElement;
			if (element) {
				element.style.width = '400px';
			}

			// Manually trigger update
			cmp.bounding.update();
			fixture.detectChanges();

			expect(cmp.bounding.width()).toBe(400);
			done();
		}, 100);
	});

	it('should reset values to 0 when element is removed and reset is true', (done) => {
		@Component({
			standalone: true,
			template: `
				@if (showElement()) {
					<div #target style="width: 200px; height: 100px;">Target</div>
				}
			`,
		})
		class TestWithConditional {
			showElement = signal(true);
			target = viewChild<ElementRef<HTMLDivElement>>('target');
			bounding = injectElementBounding(this.target, { reset: true });
		}

		const fixture = TestBed.createComponent(TestWithConditional);
		fixture.detectChanges();
		const cmp = fixture.componentInstance;

		setTimeout(() => {
			fixture.detectChanges();
			expect(cmp.bounding.width()).toBeGreaterThan(0);

			// Hide element
			cmp.showElement.set(false);
			fixture.detectChanges();

			// Trigger update manually to recalculate
			cmp.bounding.update();
			fixture.detectChanges();

			expect(cmp.bounding.width()).toBe(0);
			expect(cmp.bounding.height()).toBe(0);
			done();
		}, 100);
	});

	it('should not reset values when element is removed and reset is false', (done) => {
		@Component({
			standalone: true,
			template: `
				@if (showElement()) {
					<div #target style="width: 200px; height: 100px;">Target</div>
				}
			`,
		})
		class TestWithConditional {
			showElement = signal(true);
			target = viewChild<ElementRef<HTMLDivElement>>('target');
			bounding = injectElementBounding(this.target, { reset: false });
		}

		const fixture = TestBed.createComponent(TestWithConditional);
		fixture.detectChanges();
		const cmp = fixture.componentInstance;

		setTimeout(() => {
			fixture.detectChanges();
			const originalWidth = cmp.bounding.width();
			expect(originalWidth).toBeGreaterThan(0);

			// Hide element
			cmp.showElement.set(false);
			fixture.detectChanges();

			// Trigger update manually
			cmp.bounding.update();
			fixture.detectChanges();

			// Values should remain the same
			expect(cmp.bounding.width()).toBe(originalWidth);
			done();
		}, 100);
	});

	it('should work with raw HTMLElement', (done) => {
		@Component({
			standalone: true,
			template: `
				<div #target style="width: 250px; height: 150px;">Target</div>
			`,
		})
		class TestWithRawElement {
			target = viewChild<ElementRef<HTMLDivElement>>('target');
			elementSignal = signal<HTMLElement | null>(null);
			bounding = injectElementBounding(this.elementSignal);

			ngAfterViewInit() {
				const el = this.target()?.nativeElement;
				if (el) {
					this.elementSignal.set(el);
				}
			}
		}

		const fixture = TestBed.createComponent(TestWithRawElement);
		fixture.detectChanges();
		const cmp = fixture.componentInstance;

		setTimeout(() => {
			fixture.detectChanges();
			expect(cmp.bounding.width()).toBe(250);
			expect(cmp.bounding.height()).toBe(150);
			done();
		}, 100);
	});
});
