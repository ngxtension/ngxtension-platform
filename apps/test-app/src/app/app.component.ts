import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
	imports: [RouterLink, RouterOutlet, RouterLinkActive],
	selector: 'ngxtension-platform-root',
	template: `
		<h1>Welcome test-app</h1>

		<div style="display: grid; grid-template-columns: 300px 1fr; gap: 10px;">
			<div style="border-right: 1px solid black; padding-right: 10px;">
				<ul>
					<li>
						<a routerLinkActive="active" routerLink="/resize">Resize</a>
					</li>
					<li>
						<a routerLinkActive="active" routerLink="/if-validator">
							If Validator
						</a>
					</li>
					<li>
						<a routerLinkActive="active" routerLink="/track-by">Track By</a>
					</li>
					<li>
						<a routerLinkActive="active" routerLink="/intl">Intl</a>
					</li>
					<li>
						<a routerLinkActive="active" routerLink="/drag">Drag Gesture</a>
					</li>
					<li>
						<a routerLinkActive="active" routerLink="/active-element">
							Active Element
						</a>
					</li>
					<li>
						<a
							routerLinkActive="active"
							routerLink="/inject-document-visibility"
						>
							Document Visibility State
						</a>
					</li>
					<li>
						<a routerLinkActive="active" routerLink="/control-error">
							Control Error
						</a>
					</li>
					<li>
						<a routerLinkActive="active" routerLink="/svg-sprite">Svg Sprite</a>
					</li>
					<li>
						<a routerLinkActive="active" routerLink="/control-value-accessor">
							Control Value Accessor
						</a>
					</li>
					<li>
						<a routerLinkActive="active" routerLink="/form-events">
							Form Events
						</a>
					</li>
					<li>
						<a routerLinkActive="active" routerLink="/linked-query-param">
							Linked Query Param
						</a>
					</li>
					<li>
						<a routerLinkActive="active" routerLink="/signal-history">
							Signal History
						</a>
					</li>
					<li>
						<a routerLinkActive="active" routerLink="/text-selection">
							Text Selection
						</a>
					</li>
				</ul>
			</div>
			<div>
				<router-outlet />
			</div>
		</div>
	`,
	styles: `
		ul {
			display: flex;
			justify-content: flex-start;
			flex-direction: column;
			gap: 15px;
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

		.active {
			background: black;
			color: white;
		}
	`,
})
export class AppComponent {}
