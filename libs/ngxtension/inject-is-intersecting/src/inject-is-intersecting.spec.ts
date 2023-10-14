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
			isInViewportService.intersect(fixture.nativeElement, entry);
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
			isInViewportService.intersect(component.divEl, entry);

			expect(component.intersected).toBe(true);
		});
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
