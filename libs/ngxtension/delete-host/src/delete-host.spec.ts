import { Component, ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeleteHostDirective } from './delete-host';

@Component({
	template: `
		<div id="parent">
			<div delete-host id="host">
				<p id="child1">Child 1</p>
				<p id="child2">Child 2</p>
			</div>
		</div>
	`,
})
class TestComponent {}

describe('DeleteHostDirective', () => {
	let fixture: ComponentFixture<TestComponent>;
	let elementRef: ElementRef;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [TestComponent],
			imports: [DeleteHostDirective],
		});

		fixture = TestBed.createComponent(TestComponent);
		fixture.detectChanges(); // Trigger Angular lifecycle hooks
		elementRef = fixture.debugElement.nativeElement;
	});

	it('should remove the host element but keep its children in the parent', () => {
		const parentElement = fixture.nativeElement.querySelector('#parent');
		const hostElement = fixture.nativeElement.querySelector('#host');
		const child1 = fixture.nativeElement.querySelector('#child1');
		const child2 = fixture.nativeElement.querySelector('#child2');

		// Host element should be removed
		expect(hostElement).toBeNull();

		// Child elements should still exist and be direct children of the parent
		expect(parentElement.contains(child1)).toBe(true);
		expect(parentElement.contains(child2)).toBe(true);
		expect(child1.parentNode).toBe(parentElement);
		expect(child2.parentNode).toBe(parentElement);
	});
});
