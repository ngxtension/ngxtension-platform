import { Component, OnInit } from '@angular/core';
import {
	ComponentFixture,
	TestBed,
	fakeAsync,
	tick,
} from '@angular/core/testing';
import { interval, takeUntil } from 'rxjs';
import { injectDestroy } from './inject-destroy';

describe(injectDestroy.name, () => {
	describe('emits when the component is destroyed', () => {
		@Component({ standalone: true, template: '' })
		class TestComponent implements OnInit {
			destroy$ = injectDestroy();
			count = 0;

			ngOnInit() {
				interval(1000)
					.pipe(takeUntil(this.destroy$))
					.subscribe(() => this.count++);
			}
		}

		let component: TestComponent;
		let fixture: ComponentFixture<TestComponent>;

		beforeEach(async () => {
			await TestBed.configureTestingModule({
				imports: [TestComponent],
			}).compileComponents();
			fixture = TestBed.createComponent(TestComponent);
			component = fixture.componentInstance;
		});

		it('should handle async stuff', fakeAsync(() => {
			component.ngOnInit();

			expect(component.count).toBe(0);
			tick(1000);
			expect(component.count).toBe(1);
			tick(1000);
			expect(component.count).toBe(2);

			fixture.destroy(); // destroy the component here

			tick(1000);
			expect(component.count).toBe(2);
		}));
	});
});
