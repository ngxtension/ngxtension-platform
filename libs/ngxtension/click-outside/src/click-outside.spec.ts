import { Component, DebugElement, ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ClickOutside } from './click-outside';

@Component({
	standalone: true,
	template: `
		<div clickOutside></div>
	`,
	imports: [ClickOutside],
})
class TestComponent {
	constructor(public elementRef: ElementRef) {}
}

describe('ClickOutside', () => {
	let fixture: ComponentFixture<TestComponent>;
	let directive: ClickOutside;
	let debugElement: DebugElement;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [ClickOutside, TestComponent],
		});

		fixture = TestBed.createComponent(TestComponent);
		debugElement = fixture.debugElement.query(By.directive(ClickOutside));
		directive = debugElement.injector.get(ClickOutside);

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
