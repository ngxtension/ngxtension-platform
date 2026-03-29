import { Component, signal } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { injectMediaQuery } from './inject-media-query';

describe(injectMediaQuery.name, () => {
	@Component({
		standalone: true,
		template: ``,
	})
	class TestComponent {
		isLargeScreen = injectMediaQuery('(min-width: 1024px)');
	}

	@Component({
		standalone: true,
		template: ``,
	})
	class TestDynamicQueryComponent {
		query = signal('(min-width: 768px)');
		matches = injectMediaQuery(this.query);
	}

	function setup() {
		const fixture = TestBed.createComponent(TestComponent);
		fixture.detectChanges();
		return {
			fixture,
			component: fixture.componentInstance,
		};
	}

	function setupDynamic() {
		const fixture = TestBed.createComponent(TestDynamicQueryComponent);
		fixture.detectChanges();
		return {
			fixture,
			component: fixture.componentInstance,
		};
	}

	it('should be defined', () => {
		expect(injectMediaQuery).toBeDefined();
	});

	it('should create a media query signal', () => {
		const { component } = setup();
		expect(typeof component.isLargeScreen()).toBe('boolean');
	});

	it('should return false when matchMedia is not supported', () => {
		@Component({
			standalone: true,
			template: ``,
		})
		class TestNoMatchMediaComponent {
			matches = injectMediaQuery('(min-width: 1024px)', {
				window: {} as Window,
			});
		}

		const fixture = TestBed.createComponent(TestNoMatchMediaComponent);
		fixture.detectChanges();

		expect(fixture.componentInstance.matches()).toBe(false);
	});

	it('should evaluate media query on initialization', () => {
		const mockWindow = {
			matchMedia: (query: string) => ({
				matches: query === '(min-width: 768px)',
				media: query,
				onchange: null,
				addEventListener: () => {},
				removeEventListener: () => {},
				addListener: () => {},
				removeListener: () => {},
				dispatchEvent: () => true,
			}),
		} as unknown as Window;

		@Component({
			standalone: true,
			template: ``,
		})
		class TestCustomWindowComponent {
			matches = injectMediaQuery('(min-width: 768px)', {
				window: mockWindow,
			});
		}

		const fixture = TestBed.createComponent(TestCustomWindowComponent);
		fixture.detectChanges();

		expect(fixture.componentInstance.matches()).toBe(true);
	});

	it('should handle media query changes', fakeAsync(() => {
		let changeListener: ((event: MediaQueryListEvent) => void) | undefined =
			undefined;

		const mockMediaQueryList = {
			matches: false,
			media: '(min-width: 1024px)',
			onchange: null,
			addEventListener: (
				type: string,
				listener: (event: MediaQueryListEvent) => void,
			) => {
				if (type === 'change') {
					changeListener = listener;
				}
			},
			removeEventListener: () => {},
			addListener: () => {},
			removeListener: () => {},
			dispatchEvent: () => true,
		} as MediaQueryList;

		const mockWindow = {
			matchMedia: () => mockMediaQueryList,
		} as unknown as Window;

		@Component({
			standalone: true,
			template: ``,
		})
		class TestChangeComponent {
			matches = injectMediaQuery('(min-width: 1024px)', {
				window: mockWindow,
			});
		}

		const fixture = TestBed.createComponent(TestChangeComponent);
		fixture.detectChanges();
		tick();

		expect(fixture.componentInstance.matches()).toBe(false);

		// Simulate media query change
		expect(changeListener).toBeDefined();
		changeListener!({ matches: true } as MediaQueryListEvent);
		tick();
		expect(fixture.componentInstance.matches()).toBe(true);
	}));

	it('should handle dynamic query changes', fakeAsync(() => {
		const mockWindow = {
			matchMedia: (query: string) => ({
				matches: query === '(min-width: 1024px)',
				media: query,
				onchange: null,
				addEventListener: () => {},
				removeEventListener: () => {},
				addListener: () => {},
				removeListener: () => {},
				dispatchEvent: () => true,
			}),
		} as unknown as Window;

		@Component({
			standalone: true,
			template: ``,
		})
		class TestDynamicComponent {
			query = signal('(min-width: 768px)');
			matches = injectMediaQuery(this.query, {
				window: mockWindow,
			});
		}

		const fixture = TestBed.createComponent(TestDynamicComponent);
		fixture.detectChanges();
		tick();

		expect(fixture.componentInstance.matches()).toBe(false);

		// Change query
		fixture.componentInstance.query.set('(min-width: 1024px)');
		fixture.detectChanges();
		tick();

		expect(fixture.componentInstance.matches()).toBe(true);
	}));

	it('should work with various media query types', () => {
		const queries = [
			'(min-width: 768px)',
			'(max-width: 1024px)',
			'(orientation: portrait)',
			'(prefers-color-scheme: dark)',
			'(hover: hover)',
			'print',
		];

		queries.forEach((query) => {
			@Component({
				standalone: true,
				template: ``,
			})
			class TestQueryComponent {
				matches = injectMediaQuery(query);
			}

			const fixture = TestBed.createComponent(TestQueryComponent);
			fixture.detectChanges();

			expect(typeof fixture.componentInstance.matches()).toBe('boolean');
		});
	});

	it('should handle empty query string', () => {
		@Component({
			standalone: true,
			template: ``,
		})
		class TestEmptyQueryComponent {
			matches = injectMediaQuery('');
		}

		const fixture = TestBed.createComponent(TestEmptyQueryComponent);
		fixture.detectChanges();

		expect(fixture.componentInstance.matches()).toBe(false);
	});

	it('should work with complex media queries', () => {
		const mockWindow = {
			matchMedia: (query: string) =>
				({
					matches:
						query === '(min-width: 768px) and (max-width: 1024px)' ||
						query === '(min-width: 768px), (orientation: portrait)',
					media: query,
					onchange: null,
					addEventListener: () => {},
					removeEventListener: () => {},
					addListener: () => {},
					removeListener: () => {},
					dispatchEvent: () => true,
				}) as MediaQueryList,
		} as unknown as Window;

		@Component({
			standalone: true,
			template: ``,
		})
		class TestComplexQueryComponent {
			matchesAnd = injectMediaQuery(
				'(min-width: 768px) and (max-width: 1024px)',
				{
					window: mockWindow,
				},
			);
			matchesOr = injectMediaQuery(
				'(min-width: 768px), (orientation: portrait)',
				{
					window: mockWindow,
				},
			);
		}

		const fixture = TestBed.createComponent(TestComplexQueryComponent);
		fixture.detectChanges();

		expect(fixture.componentInstance.matchesAnd()).toBe(true);
		expect(fixture.componentInstance.matchesOr()).toBe(true);
	});

	it('should return readonly signal', () => {
		const { component } = setup();
		const signal = component.isLargeScreen;

		// The signal should not have a 'set' method (readonly)
		expect(typeof signal).toBe('function');
		expect((signal as any).set).toBeUndefined();
	});
});
