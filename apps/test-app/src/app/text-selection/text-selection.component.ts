import { NgStyle } from '@angular/common';
import { Component, effect } from '@angular/core';
import { injectTextSelection } from 'ngxtension/inject-text-selection';

@Component({
	selector: 'text-selection-component',
	template: `
		<div class="text-container">
			<p>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia
				odio vitae vestibulum vestibulum. Cras venenatis euismod malesuada.
				Curabitur ut est nec leo tristique mollis.
			</p>
			<p>Select some text in this area and watch the highlight appear.</p>
		</div>
		<!-- The highlight overlay covers the entire viewport -->
		<div class="highlight-overlay">
			<!-- Iterate over each selection range's bounding rect -->
			@for (rect of this.selectionState.rects(); track $index) {
				<div
					class="highlight-box"
					[ngStyle]="{
						top: rect.top + 'px',
						left: rect.left + 'px',
						width: rect.width + 'px',
						height: rect.height + 'px',
					}"
				></div>
			}
		</div>
	`,
	styles: [
		`
			::selection {
				background: transparent;
			}

			/* Container for the text */
			.text-container {
				padding: 20px;
				line-height: 1.6;
				font-size: 16px;
			}

			/* Full-page overlay to draw the highlight boxes.
       Using pointer-events: none ensures the overlay doesn’t block interaction with the page. */
			.highlight-overlay {
				position: fixed;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				pointer-events: none;
				z-index: 1000;
			}

			/* Styling for each highlight box */
			.highlight-box {
				position: absolute;
				background: linear-gradient(
					45deg,
					rgba(255, 255, 0, 0.4),
					rgba(255, 200, 0, 0.4)
				);
				border: 1px solid rgba(255, 200, 0, 0.8);
				border-radius: 3px;
			}
		`,
	],
	standalone: true,
	imports: [NgStyle],
})
export default class TextSelectionComponent {
	// Use the injectTextSelection hook to track selection state.
	selectionState = injectTextSelection();
	constructor() {
		// Optionally, log changes for debugging.
		effect(() => {
			console.log('Selected text:', this.selectionState.text());
			console.log('Selection ranges:', this.selectionState.ranges());
			console.log('Bounding rects:', this.selectionState.rects());
		});
	}
}
