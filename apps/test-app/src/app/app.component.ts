import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
	standalone: true,
	imports: [RouterLink, RouterOutlet],
	selector: 'ngxtension-platform-root',
	template: `
		<h1>Welcome test-app</h1>

		<ul>
			<li>
				<a routerLink="/resize">Resize</a>
			</li>

			<li>
				<a routerLink="/if-validator">If Validator</a>
			</li>

			<li>
				<a routerLink="/track-by">Track By</a>
			</li>

			<li>
				<a routerLink="/intl">Intl</a>
			</li>

			<li>
				<a routerLink="/drag">Drag Gesture</a>
			</li>
			<li>
				<a routerLink="/active-element">Active Element</a>
			</li>
			<li>
				<a routerLink="/inject-document-visibility">
					Document Visibility State
				</a>
			</li>

			<li>
				<a routerLink="/control-error">Control Error</a>
			</li>

			<li>
				<a routerLink="/svg-sprite">Svg Sprite</a>
			</li>

			<li>
				<a routerLink="/control-value-accessor">Control Value Accessor</a>
			</li>

			<li>
				<a routerLink="/form-events">Form Events</a>
			</li>

			<li>
				<a routerLink="/linked-query-param">Linked Query Param</a>
			</li>

			<li>
				<a routerLink="/signal-history">Signal History</a>
			</li>

			<li>
				<a routerLink="/text-selection">Text Selection</a>
			</li>
		</ul>

		<hr />
		<router-outlet />
	`,

	styles: `
		ul {
			display: flex;
			justify-content: flex-start;
			gap: 5px;
			list-style: none;
		}

		a {
			text-decoration: none;
			border: 1px solid black;
			padding: 5px;
			color: black;
		}
		a:hover {
			background: black;
			color: white;
		}
	`,
})
export class AppComponent {}
