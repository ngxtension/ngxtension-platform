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
		</ul>

		<hr />
		<router-outlet />
	`,
})
export class AppComponent {}
