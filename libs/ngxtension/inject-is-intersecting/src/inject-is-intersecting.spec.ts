import { Component, inject, Injector, OnInit, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject, take } from 'rxjs';
import { injectIsIntersecting } from './inject-is-intersecting';
import {
	IsInViewportService,
	IsInViewportServiceInterface,
} from './is-in-viewport.service';

describe(injectIsIntersecting.name, () => {
	describe('should emit when component itself is intersecting', () => {
		@Component({ standalone: true, template: '' })
		class TestComponent {
			isIntersecting$ = injectIsIntersecting();
		}

		let component: TestComponent;
		let fixture: ComponentFixture<TestComponent>;
		let isInViewportService: IsInViewportServiceInterface;

		beforeEach(async () => {
			await TestBed.configureTestingModule({
				imports: [TestComponent],
				providers: [
					{
						provide: IsInViewportService,
						useValue: new MockIsInViewportService(),
					},
				],
			}).compileComponents();

			fixture = TestBed.createComponent(TestComponent);
			component = fixture.componentInstance;
			isInViewportService = TestBed.inject(IsInViewportService);
		});

		it('in injection context', (done) => {
			component.isIntersecting$.pipe(take(1)).subscribe((x) => {
				expect(x.isIntersecting).toBe(true);
				done();
			});
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			const entry: IntersectionObserverEntry = { isIntersecting: true };
			(isInViewportService as any).intersect(fixture.nativeElement, entry);
		});
	});

	describe('should emit when given element is intersecting', () => {
		@Component({
			standalone: true,
			template: `
				<div #el></div>
			`,
		})
		class TestComponent implements OnInit {
			private injector = inject(Injector);
			@ViewChild('el', { static: true }) divEl!: HTMLDivElement;

			intersected = false;

			ngOnInit() {
				injectIsIntersecting({ element: this.divEl, injector: this.injector })
					.pipe(take(1))
					.subscribe((entry) => {
						this.intersected = entry.target === this.divEl;
					});
			}
		}

		let component: TestComponent;
		let fixture: ComponentFixture<TestComponent>;
		let isInViewportService: IsInViewportServiceInterface;

		beforeEach(async () => {
			await TestBed.configureTestingModule({
				imports: [TestComponent],
				providers: [
					{
						provide: IsInViewportService,
						useValue: new MockIsInViewportService(),
					},
				],
			}).compileComponents();

			fixture = TestBed.createComponent(TestComponent);
			component = fixture.componentInstance;
			isInViewportService = TestBed.inject(IsInViewportService);
		});

		it('not in injection context when provided with an injector', () => {
			expect(component.intersected).toBe(false);
			component.ngOnInit();

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			const entry: IntersectionObserverEntry = {
				isIntersecting: true,
				target: component.divEl,
				// target: document.createElement('div') --> uncomment this to fail the test
			};
			(isInViewportService as any).intersect(component.divEl, entry);

			expect(component.intersected).toBe(true);
		});
	});
});

describe(IsInViewportService.name, () => {
	let service: IsInViewportService;
	let observeSpy: jest.Mock;
	let unobserveSpy: jest.Mock;
	let disconnectSpy: jest.Mock;
	let originalIntersectionObserver: any;

	beforeEach(() => {
		// Setup spies for the native IntersectionObserver
		observeSpy = jest.fn();
		unobserveSpy = jest.fn();
		disconnectSpy = jest.fn();

		// Mock the global IntersectionObserver
		originalIntersectionObserver = window.IntersectionObserver;
		window.IntersectionObserver = jest.fn().mockImplementation(() => ({
			observe: observeSpy,
			unobserve: unobserveSpy,
			disconnect: disconnectSpy,
		})) as any;

		TestBed.configureTestingModule({
			providers: [IsInViewportService],
		});

		service = TestBed.inject(IsInViewportService);
	});

	afterEach(() => {
		// Restore the original IntersectionObserver to avoid leaking into other tests
		window.IntersectionObserver = originalIntersectionObserver;
	});

	it('should track refcounts and only unobserve/disconnect when the count reaches zero', () => {
		const el = document.createElement('div');

		// 1. First consumer starts observing
		service.observe(el);
		expect(observeSpy).toHaveBeenCalledWith(el);
		expect(observeSpy).toHaveBeenCalledTimes(1);

		// 2. Second consumer starts observing the SAME element
		service.observe(el);

		// The native observe method should NOT be called a second time
		expect(observeSpy).toHaveBeenCalledTimes(1);

		// 3. First consumer stops observing
		service.unobserve(el);

		// Because the second consumer is still observing, it should bail early
		expect(unobserveSpy).not.toHaveBeenCalled();
		expect(disconnectSpy).not.toHaveBeenCalled();

		// 4. Second consumer stops observing
		service.unobserve(el);

		// Now that the refcount is 0, it should fully unobserve the element
		expect(unobserveSpy).toHaveBeenCalledWith(el);
		expect(unobserveSpy).toHaveBeenCalledTimes(1);

		// Since this was the last observed element in the entire service, it should disconnect
		expect(disconnectSpy).toHaveBeenCalledTimes(1);
	});
});

class MockIsInViewportService implements IsInViewportServiceInterface {
	elMap = new Map<Element, Subject<IntersectionObserverEntry>>();

	observe(element: Element): Subject<IntersectionObserverEntry> {
		const subject = new Subject<IntersectionObserverEntry>();
		this.elMap.set(element, subject);
		return subject;
	}

	unobserve(element: Element): void {
		this.elMap.delete(element);
	}

	intersect(element: Element, entry: IntersectionObserverEntry) {
		this.elMap.get(element)?.next(entry);
	}
}
