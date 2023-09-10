import { JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { injectResize } from 'ngxtension/resize';

@Component({
	standalone: true,
	template: `
		<pre>{{ resize() | json }}</pre>
	`,
	host: {
		style: 'display: block',
	},
	imports: [JsonPipe],
})
export default class TestResize {
	private resize$ = injectResize();
	resize = toSignal(this.resize$);
}
