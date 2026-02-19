import { JsonPipe } from '@angular/common';
import { Component, numberAttribute } from '@angular/core';
import { RouterLink } from '@angular/router';
import { injectParams } from 'ngxtension/inject-params';

@Component({
	selector: 'app-inject-params-global',
	standalone: true,
	imports: [JsonPipe, RouterLink],
	template: `
		<div style="padding: 20px; font-family: monospace;">
			<h1>injectParams.global Examples</h1>

			<div
				style="margin: 20px 0; padding: 15px; background: #e3f2fd; border-radius: 4px;"
			>
				<h3>Test Routes:</h3>
				<div style="display: flex; gap: 10px; flex-wrap: wrap;">
					<a
						routerLink="/inject-params-global/parent/123/child/456"
						style="padding: 10px 15px; background: #2196f3; color: white; text-decoration: none; border-radius: 4px; cursor: pointer;"
					>
						Parent 123 / Child 456
					</a>
					<a
						routerLink="/inject-params-global/parent/999/child/888"
						[queryParams]="{ search: 'test', category: 'books' }"
						style="padding: 10px 15px; background: #4caf50; color: white; text-decoration: none; border-radius: 4px; cursor: pointer;"
					>
						Parent 999 / Child 888 (with query params)
					</a>
					<a
						routerLink="/inject-params-global/parent/abc/child/xyz"
						[queryParams]="{ status: 'pending' }"
						style="padding: 10px 15px; background: #ff9800; color: white; text-decoration: none; border-radius: 4px; cursor: pointer;"
					>
						Parent abc / Child xyz (status=pending)
					</a>
				</div>
			</div>

			<div style="margin-top: 20px;">
				<h2>1. All params from hierarchy (no arguments)</h2>
				<pre>{{ allParams() | json }}</pre>
			</div>

			<div style="margin-top: 20px;">
				<h2>2. Specific param by key (string)</h2>
				<p>
					Parent ID:
					<strong>{{ parentId() }}</strong>
				</p>
				<p>
					Child ID:
					<strong>{{ childId() }}</strong>
				</p>
			</div>

			<div style="margin-top: 20px;">
				<h2>3. Transform function</h2>
				<p>
					All param keys:
					<strong>{{ paramKeys() }}</strong>
				</p>
				<p>
					Combined IDs:
					<strong>{{ combinedIds() }}</strong>
				</p>
			</div>

			<div style="margin-top: 20px;">
				<h2>4. With parse option (numberAttribute)</h2>
				<p>
					Parent ID as number:
					<strong>{{ parentIdNumber() }}</strong>
					(type: {{ typeof parentIdNumber() }})
				</p>
				<p>
					Child ID as number:
					<strong>{{ childIdNumber() }}</strong>
					(type: {{ typeof childIdNumber() }})
				</p>
			</div>

			<div style="margin-top: 20px;">
				<h2>5. With defaultValue option</h2>
				<p>
					Category (with default):
					<strong>{{ category() }}</strong>
				</p>
				<p>
					Status (with default):
					<strong>{{ status() }}</strong>
				</p>
			</div>

			<div style="margin-top: 20px;">
				<h2>6. Custom transform with type</h2>
				<p>
					Product Info:
					<strong>{{ productInfo() | json }}</strong>
				</p>
			</div>
		</div>
	`,
})
export default class InjectParamsGlobalComponent {
	// Pattern 1: Get all params from route hierarchy
	allParams = injectParams.global();

	// Pattern 2: Get specific param by key
	parentId = injectParams.global('parentId');
	childId = injectParams.global('childId');

	// Pattern 3: Transform function - get all keys
	paramKeys = injectParams.global((params) => Object.keys(params).join(', '));

	// Pattern 3: Transform function - combine multiple params
	combinedIds = injectParams.global((params) => {
		const parentId = params['parentId'] as string;
		const childId = params['childId'] as string;
		return { parentId, childId };
	});

	// Pattern 4: With parse option (convert string to number)
	parentIdNumber = injectParams.global('parentId', { parse: numberAttribute });
	childIdNumber = injectParams.global('childId', { parse: numberAttribute });

	childIdNumberWithDefault = injectParams.global('childId', {
		parse: numberAttribute,
		defaultValue: 0,
	});

	// Pattern 5: With defaultValue option
	category = injectParams.global('category', { defaultValue: 'uncategorized' });
	status = injectParams.global('status', { defaultValue: 'active' });

	// Pattern 6: Custom transform with typed return
	productInfo = injectParams.global((params) => ({
		parentId: params['parentId'] || 'none',
		childId: params['childId'] || 'none',
		hasSearch: 'search' in params,
		totalParams: Object.keys(params).length,
	}));
}
