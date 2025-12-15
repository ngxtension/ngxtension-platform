import { Component, Injector, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { injectAttribute } from './inject-attribute';

describe(injectAttribute.name, () => {
	describe('with default value', () => {
		it('should return default value when attribute is not present', () => {
			@Component({
				selector: 'test-component',
				standalone: true,
				template: '',
			})
			class TestComponent {
				variation = injectAttribute<string>('variation', 'ngx-default');
			}

			const fixture = TestBed.createComponent(TestComponent);
			fixture.detectChanges();

			expect(fixture.componentInstance.variation).toBe('ngx-default');
		});

		it('should work with different default values', () => {
			@Component({
				selector: 'test-component',
				standalone: true,
				template: '',
			})
			class TestComponent {
				stringAttr = injectAttribute<string>('string-attr', 'ngx-default');
				numberAttr = injectAttribute<number>('number-attr', 0);
			}

			const fixture = TestBed.createComponent(TestComponent);
			fixture.detectChanges();

			expect(fixture.componentInstance.stringAttr).toBe('ngx-default');
			expect(fixture.componentInstance.numberAttr).toBe(0);
		});

		it('should return default value when transform is provided but attribute is missing', () => {
			@Component({
				selector: 'test-component',
				standalone: true,
				template: '',
			})
			class TestComponent {
				count = injectAttribute<number>('count', 42, {
					transform: (value) => Number(value),
				});
				disabled = injectAttribute('disabled', true, {
					transform: (value) => value === '' || value === 'true',
				});
			}

			const fixture = TestBed.createComponent(TestComponent);
			fixture.detectChanges();

			expect(fixture.componentInstance.count).toBe(42);
			expect(fixture.componentInstance.disabled).toBe(true);
		});
	});

	describe('with custom injector', () => {
		it('should use custom injector when provided', () => {
			@Component({
				selector: 'test-component',
				standalone: true,
				template: '',
			})
			class TestComponent {
				private customInjector = inject(Injector);
				variation = injectAttribute<string>('variation', 'primary', {
					injector: this.customInjector,
				});
			}

			const fixture = TestBed.createComponent(TestComponent);
			fixture.detectChanges();

			expect(fixture.componentInstance.variation).toBe('primary');
		});
	});

	describe('injectAttribute.required', () => {
		it('should throw error when attribute is not present', () => {
			@Component({
				selector: 'test-component',
				standalone: true,
				template: '',
			})
			class TestComponent {
				variation = injectAttribute.required<string>('variation');
			}

			expect(() => {
				TestBed.createComponent(TestComponent);
			}).toThrow();
		});

		it('should return attribute value when present', () => {
			@Component({
				selector: 'test-component',
				standalone: true,
				template: '',
			})
			class TestComponent {
				variation = injectAttribute.required<string>('variation');
			}

			@Component({
				selector: 'wrapper',
				standalone: true,
				imports: [TestComponent],
				template: '<test-component variation="primary" />',
			})
			class WrapperComponent {}

			const fixture = TestBed.createComponent(WrapperComponent);
			fixture.detectChanges();

			const testComponent = fixture.debugElement.query(
				(el) => el.name === 'test-component',
			).componentInstance as TestComponent;

			expect(testComponent.variation).toBe('primary');
		});

		it('should use transform function for type coercion', () => {
			@Component({
				selector: 'test-component',
				standalone: true,
				template: '',
			})
			class TestComponent {
				maxlength = injectAttribute.required<number>('maxlength', {
					transform: (value) => Number(value),
				});
			}

			@Component({
				selector: 'wrapper',
				standalone: true,
				imports: [TestComponent],
				template: '<test-component maxlength="100" />',
			})
			class WrapperComponent {}

			const fixture = TestBed.createComponent(WrapperComponent);
			fixture.detectChanges();

			const testComponent = fixture.debugElement.query(
				(el) => el.name === 'test-component',
			).componentInstance as TestComponent;

			expect(testComponent.maxlength).toBe(100);
		});
	});
});
