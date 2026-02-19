import { JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { injectParams } from 'ngxtension/inject-params';

@Component({
	selector: 'app-parent',
	imports: [RouterOutlet, JsonPipe],
	template: `
		<div style="border: 2px solid blue; padding: 10px; margin: 10px;">
			<h3>Parent Component</h3>
			<p>
				Parent ID from route:
				<strong>{{ parentId() }}</strong>
			</p>
			<div>
				All params visible at parent level:
				<pre>
          {{ allParams() | json }}
        </pre
				>
			</div>
			<router-outlet />
		</div>
	`,
})
export default class ParentComponent {
	// Using regular injectParams at parent level
	parentId = injectParams('parentId');
	allParams = injectParams();
}
