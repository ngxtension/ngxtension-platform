import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { injectTextSelection } from './inject-text-selection';

@Component({
	template: '<div>Test Component</div>',
})
class TestSelectionComponent {
	// We call the utility so that its signals are available on the component.
	public textSelection = injectTextSelection();
}

describe(injectTextSelection.name, () => {
	let fixture: ComponentFixture<TestSelectionComponent>;
	let component: TestSelectionComponent;
	let originalGetSelection: typeof window.getSelection;
	let fakeRange: Range;
	let fakeSelection: Selection;

	beforeEach(() => {
		// Store the original window.getSelection so we can restore it later.
		originalGetSelection = window.getSelection;

		// Create a fake Range instance with a stubbed getBoundingClientRect.
		fakeRange = document.createRange();
		fakeRange.getBoundingClientRect = () => ({
			top: 100,
			left: 50,
			width: 200,
			height: 20,
			right: 250,
			bottom: 120,
			x: 50,
			y: 100,
			toJSON: () => ({
				top: 100,
				left: 50,
				width: 200,
				height: 20,
				right: 250,
				bottom: 120,
			}),
		});

		// Create a fake Selection object.
		fakeSelection = {
			rangeCount: 1,
			getRangeAt: (_index: number) => fakeRange,
			toString: () => 'Fake selected text',
		} as unknown as Selection;

		// Configure the testing module with our test component.
		TestBed.configureTestingModule({
			imports: [TestSelectionComponent],
		});

		// Create the component and trigger initial change detection.
		fixture = TestBed.createComponent(TestSelectionComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	afterEach(() => {
		// Restore the original window.getSelection.
		window.getSelection = originalGetSelection;
	});

	it('should initialize with empty text and no ranges', () => {
		// Before any selection event, the signals should be empty.
		expect(component.textSelection.text()).toBe('');
		expect(component.textSelection.ranges().length).toBe(0);
		expect(component.textSelection.rects().length).toBe(0);
	});

	it('should update signals after a selection change event', () => {
		// Override window.getSelection to return our fakeSelection.
		window.getSelection = () => fakeSelection;

		// Dispatch a 'selectionchange' event on the document.
		window.document.dispatchEvent(new Event('selectionchange'));
		fixture.detectChanges();

		// The text signal should now reflect the fake selection's text.
		expect(component.textSelection.text()).toBe('Fake selected text');

		// The ranges signal should contain one range which is our fakeRange.
		expect(component.textSelection.ranges().length).toBe(1);
		expect(component.textSelection.ranges()[0]).toBe(fakeRange);

		// The rects signal should return the bounding client rect of fakeRange.
		const rects = component.textSelection.rects();
		expect(rects.length).toBe(1);
		const expectedRect = fakeRange.getBoundingClientRect();
		expect(rects[0].top).toBe(expectedRect.top);
		expect(rects[0].left).toBe(expectedRect.left);

		// Finally, check that the raw selection signal now equals our fake selection.
		expect(component.textSelection.selection()).toBe(fakeSelection);
	});
});
