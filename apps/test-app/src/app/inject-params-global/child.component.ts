import { JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import { injectParams } from 'ngxtension/inject-params';

@Component({
	selector: 'app-child',
	standalone: true,
	imports: [JsonPipe],
	template: `
		<div style="border: 2px solid green; padding: 10px; margin: 10px;">
			<h4>Child Component</h4>
			<p>
				Child ID from route:
				<strong>{{ childId() }}</strong>
			</p>
			<div>
				All params visible at child level:
				<pre>{{ allParams() | json }}</pre>
			</div>

			<div style="background: #f0f0f0; padding: 10px; margin-top: 10px;">
				<h5>Using injectParams.global from child:</h5>
				<p>
					Parent ID (from global):
					<strong>{{ parentIdGlobal() }}</strong>
				</p>
				<p>
					Child ID (from global):
					<strong>{{ childIdGlobal() }}</strong>
				</p>
				<div>
					All params (from global):
					<pre>{{ allParamsGlobal() | json }}</pre>
				</div>
			</div>
		</div>
	`,
})
export default class ChildComponent {
	// Using regular injectParams at child level (only sees child params)
	childId = injectParams('childId');
	allParams = injectParams();

	// Using injectParams.global to access parent params from child
	parentIdGlobal = injectParams.global('parentId');
	childIdGlobal = injectParams.global('childId');
	allParamsGlobal = injectParams.global();
}
