import { JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { injectResize } from 'ngxtension/resize';

@Component({
	template: `
		<pre>{{ resize() | json }}</pre>
	`,
	host: {
		style: 'display: block',
	},
	imports: [JsonPipe],
})
export default class TestResize {
	resize = toSignal(injectResize());
}
