import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ClickOutside } from './click-outside';

@Component({
	standalone: true,
	template: `
		<div clickOutside>
			<div id="inner-div"></div>
		</div>
		<div id="sibling-div"></div>
	`,
	imports: [ClickOutside],
})
class TestComponent {}

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

	it('should emit clickOutside event when a click occurs on sibling element', () => {
		jest.spyOn(directive.clickOutside, 'emit');
		const siblingDiv = fixture.debugElement.query(By.css('#sibling-div'));
		const fakeEvent = new MouseEvent('click');
		siblingDiv.nativeElement.click();
		expect(directive.clickOutside.emit).toHaveBeenCalledWith(fakeEvent);
	});

	it('should not emit clickOutside event when a click occurs inside the element', () => {
		jest.spyOn(directive.clickOutside, 'emit');
		const innerDiv = fixture.debugElement.query(By.css('#inner-div'));
		innerDiv.nativeElement.click();
		expect(directive.clickOutside.emit).not.toHaveBeenCalled();
	});

	it('should not emit clickOutside event when a click occurs on the element', () => {
		jest.spyOn(directive.clickOutside, 'emit');
		const clickOutsideDirectiveElement = debugElement.nativeElement;
		clickOutsideDirectiveElement.click();
		expect(directive.clickOutside.emit).not.toHaveBeenCalled();
	});
});
