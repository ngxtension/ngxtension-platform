import { Component, DebugElement, ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ClickOutsideDirective } from './click-outside';

@Component({
	standalone: true,
	template: `
		<div clickOutside></div>
	`,
	imports: [ClickOutsideDirective],
})
class TestComponent {
	constructor(public elementRef: ElementRef) {}
}

describe('ClickOutsideDirective', () => {
	let fixture: ComponentFixture<TestComponent>;
	let directive: ClickOutsideDirective;
	let debugElement: DebugElement;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [ClickOutsideDirective, TestComponent],
		});

		fixture = TestBed.createComponent(TestComponent);
		debugElement = fixture.debugElement.query(
			By.directive(ClickOutsideDirective)
		);
		directive = debugElement.injector.get(ClickOutsideDirective);

		fixture.detectChanges();
	});

	it('should create the directive', () => {
		expect(directive).toBeTruthy();
	});

	it('should emit clickOutside event when a click occurs outside the element', () => {
		jest.spyOn(directive.clickOutside, 'emit');
		const fakeEvent = new MouseEvent('click');
		document.body.click();
		expect(directive.clickOutside.emit).toHaveBeenCalledWith(fakeEvent);
	});
});
