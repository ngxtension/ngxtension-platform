import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { injectActiveElement } from 'ngxtension/active-element';

@Component({
	standalone: true,
	host: {
		style: 'display: block; margin: 12px',
	},
	imports: [AsyncPipe],
	template: `
		<button>btn1</button>
		<button>btn2</button>
		<button>btn3</button>
		<span>
			{{ (activeElement$ | async)?.innerHTML }}
		</span>
	`,
})
export default class ActiveElement {
	readonly activeElement$ = injectActiveElement();
}
