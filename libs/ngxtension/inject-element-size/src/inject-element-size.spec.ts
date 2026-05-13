import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { injectElementSize } from './inject-element-size';

describe(injectElementSize.name, () => {
	@Component({
		standalone: true,
		template: `
			<div #testElement style="width: 200px; height: 100px;">Test Element</div>
		`,
	})
	class TestComponent {
		testElement = viewChild<ElementRef>('testElement');
		size = injectElementSize(this.testElement);
	}

	@Component({
		standalone: true,
		template: `
			<div
				#dynamicElement
				[style.width.px]="width()"
				[style.height.px]="height()"
			>
				Dynamic Element
			</div>
		`,
	})
	class DynamicSizeComponent {
		width = signal(150);
		height = signal(75);
		dynamicElement = viewChild<ElementRef>('dynamicElement');
		size = injectElementSize(this.dynamicElement);
	}

	function setup() {
		const fixture = TestBed.createComponent(TestComponent);
		fixture.detectChanges();
		return fixture.componentInstance;
	}

	function setupDynamic() {
		const fixture = TestBed.createComponent(DynamicSizeComponent);
		fixture.detectChanges();
		return { component: fixture.componentInstance, fixture };
	}

	it('should initialize with element dimensions', (done) => {
		const cmp = setup();

		// Give ResizeObserver time to initialize
		setTimeout(() => {
			expect(cmp.size.width()).toBeGreaterThan(0);
			expect(cmp.size.height()).toBeGreaterThan(0);
			done();
		}, 100);
	});

	it('should return readonly signals', () => {
		const cmp = setup();
		expect(cmp.size.width).toBeDefined();
		expect(cmp.size.height).toBeDefined();
		expect(typeof cmp.size.width).toBe('function');
		expect(typeof cmp.size.height).toBe('function');
	});

	it('should update when element size changes', (done) => {
		const { component, fixture } = setupDynamic();

		// Wait for initial observation
		setTimeout(() => {
			const initialWidth = component.size.width();
			const initialHeight = component.size.height();

			// Change the size
			component.width.set(300);
			component.height.set(150);
			fixture.detectChanges();

			// Wait for ResizeObserver to detect the change
			setTimeout(() => {
				expect(component.size.width()).toBeGreaterThan(initialWidth);
				expect(component.size.height()).toBeGreaterThan(initialHeight);
				done();
			}, 100);
		}, 100);
	});

	it('should handle SVG elements', () => {
		@Component({
			standalone: true,
			template: `
				<svg #svgElement width="100" height="50">
					<rect width="100" height="50" />
				</svg>
			`,
		})
		class SVGComponent {
			svgElement = viewChild<ElementRef>('svgElement');
			size = injectElementSize(this.svgElement);
		}

		const fixture = TestBed.createComponent(SVGComponent);
		fixture.detectChanges();
		const cmp = fixture.componentInstance;

		expect(cmp.size.width).toBeDefined();
		expect(cmp.size.height).toBeDefined();
	});

	it('should use initial size when element is not available', () => {
		@Component({
			standalone: true,
			template: '',
		})
		class EmptyComponent {
			elementRef = signal<ElementRef | undefined>(undefined);
			size = injectElementSize(this.elementRef, {
				initialSize: { width: 100, height: 50 },
			});
		}

		const fixture = TestBed.createComponent(EmptyComponent);
		fixture.detectChanges();
		const cmp = fixture.componentInstance;

		expect(cmp.size.width()).toBe(100);
		expect(cmp.size.height()).toBe(50);
	});

	it('should support different box models', (done) => {
		@Component({
			standalone: true,
			template: `
				<div
					#boxElement
					style="width: 200px; height: 100px; padding: 10px; border: 5px solid black;"
				>
					Box Element
				</div>
			`,
		})
		class BoxModelComponent {
			boxElement = viewChild<ElementRef>('boxElement');
			contentBoxSize = injectElementSize(this.boxElement, {
				box: 'content-box',
			});
			borderBoxSize = injectElementSize(this.boxElement, {
				box: 'border-box',
			});
		}

		const fixture = TestBed.createComponent(BoxModelComponent);
		fixture.detectChanges();
		const cmp = fixture.componentInstance;

		// Give ResizeObserver time to initialize
		setTimeout(() => {
			// Border box should include padding and border
			expect(cmp.borderBoxSize.width()).toBeGreaterThanOrEqual(
				cmp.contentBoxSize.width(),
			);
			expect(cmp.borderBoxSize.height()).toBeGreaterThanOrEqual(
				cmp.contentBoxSize.height(),
			);
			done();
		}, 100);
	});
});
