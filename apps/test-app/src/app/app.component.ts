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
		</ul>

		<hr />
		<router-outlet />
	`,
})
export class AppComponent {}
