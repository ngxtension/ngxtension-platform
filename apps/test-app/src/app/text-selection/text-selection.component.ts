import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { injectTextSelection } from 'ngxtension/inject-text-selection';

@Component({
	selector: 'text-selection-component',
	template: `
		<h3>Text Selection</h3>
		<p style="font-size: 12px; color: gray;">
			This example demonstrates how to use the injectTextSelection hook to track
			selection state.
			<br />
			The selection will be cleared every 5 seconds (just to show that it's
			reactive).
		</p>
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
					[style]="{
						top: rect.top + 'px',
						left: rect.left + 'px',
						width: rect.width + 'px',
						height: rect.height + 'px',
					}"
				></div>
			}

			@if (showShareLink()) {
				<div
					class="popup-for-share-link"
					[style]="{
						top: shareLinkPosition().top + 'px',
						left: shareLinkPosition().right + 'px',
					}"
				>
					<a
						href="https://twitter.com/intent/tweet?text={{
							selectionState.text()
						}}"
						target="_blank"
					>
						<img
							src="https://img.icons8.com/color/48/000000/twitter.png"
							alt="twitter"
							width="24"
							height="28"
						/>
					</a>
					<span>Tweet: {{ selectionState.text() }}</span>
				</div>
			}
		</div>

		<hr />
		<div>
			Selected text:
			<b>{{ selectionState.text() }}</b>
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

			.popup-for-share-link {
				position: absolute;
				background: #fffffff7;
				border: 1px solid black;
				display: flex;
				border-radius: 3px;
				padding: 5px;
				z-index: 1000;
				align-items: center;
				gap: 10px;
				justify-content: space-between;

				a {
					color: black;
					text-decoration: none;
				}
			}
		`,
	],
	standalone: true,
})
export default class TextSelectionComponent {
	// Use the injectTextSelection hook to track selection state.
	readonly selectionState = injectTextSelection();

	showShareLink = signal(false);
	shareLinkPosition = signal({
		top: 0,
		left: 0,
		right: 0,
	});

	constructor() {
		effect(() => {
			console.log('Selected text:', this.selectionState.text());
			console.log('Selection ranges:', this.selectionState.ranges());
			console.log('Bounding rects:', this.selectionState.rects());
		});

		const interval = setInterval(() => {
			this.selectionState.clearSelection();
		}, 5000);

		inject(DestroyRef).onDestroy(() => clearInterval(interval));

		explicitEffect([this.selectionState.text], ([text], cleanup) => {
			const id = setTimeout(() => {
				if (text !== '' && text !== undefined) {
					this.showShareLink.set(true);
					this.shareLinkPosition.set(this.selectionState.rects()[0]);
				} else {
					this.showShareLink.set(false);
					this.shareLinkPosition.set({
						top: 0,
						left: 0,
						right: 0,
					});
				}
			}, 500);

			if (text === '' && text == undefined) {
				this.showShareLink.set(false);
				this.shareLinkPosition.set({
					top: 0,
					left: 0,
					right: 0,
				});
			}

			cleanup(() => {
				clearTimeout(id);
			});
		});
	}
}
