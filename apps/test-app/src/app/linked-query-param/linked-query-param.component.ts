import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
	template: `
		<div>
			<a routerLink="/linked-query-param/string" routerLinkActive="active">
				String based
			</a>

			<a routerLink="/linked-query-param/booleans" routerLinkActive="active">
				Boolean based
			</a>

			<a routerLink="/linked-query-param/number" routerLinkActive="active">
				Number based
			</a>

			<a routerLink="/linked-query-param/object" routerLinkActive="active">
				Object based
			</a>

			<a
				routerLink="/linked-query-param/inside-object"
				routerLinkActive="active"
			>
				Inside object
			</a>

			<a routerLink="/linked-query-param/array" routerLinkActive="active">
				Array based
			</a>
		</div>

		<div style="border: 1px solid black; padding: 10px;">
			<router-outlet />
		</div>
	`,
	imports: [RouterLink, RouterLinkActive, RouterOutlet],
	styles: `
		:host {
			display: grid;
			grid-template-columns: 300px 1fr;
		}

		div {
			padding: 20px;
			display: flex;
			flex-direction: column;
			gap: 5px;
		}

		a {
			color: black;
			text-decoration: none;
			padding: 10px;
			border: 1px solid black;
			width: 200px;
		}
		a:hover {
			background-color: lightgray;
		}

		a.active {
			background-color: darkblue;
			color: white;
		}
	`,
})
export default class LinkedQueryParamTypeCmp {}
