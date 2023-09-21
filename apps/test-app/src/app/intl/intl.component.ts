import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
	DisplayNamesPipe,
	PluralRulesPipe,
	RelativeTimeFormatPipe,
} from 'ngxtension/intl';

@Component({
	selector: 'ngxtension-platform-intl',
	standalone: true,
	imports: [
		CommonModule,
		DisplayNamesPipe,
		PluralRulesPipe,
		RelativeTimeFormatPipe,
	],
	template: `
		<h2>Plural Rules</h2>
		<p>
			<strong ngNonBindable>{{ 1 | pluralRules }}</strong>
			=> {{ 1 | pluralRules }}
		</p>
		<p>
			<strong ngNonBindable>{{ 2 | pluralRules }}</strong>
			=> {{ 2 | pluralRules }}
		</p>

		<h2>Relative Time Format</h2>
		<p>
			<strong ngNonBindable>{{ 1 | relativeTimeFormat : 'day' }}</strong>
			=> {{ 1 | relativeTimeFormat : 'day' }}
		</p>
		<p>
			<strong ngNonBindable>{{ -1 | relativeTimeFormat : 'day' }}</strong>
			=> {{ -1 | relativeTimeFormat : 'day' }}
		</p>

		<h2>Display Names</h2>
		<p>
			<strong ngNonBindable>{{ 'en' | displayNames : 'language' }}</strong>
			=> {{ 'en' | displayNames : 'language' }}
		</p>
		<p>
			<strong ngNonBindable>{{ 'en' | displayNames : 'script' }}</strong>
			=> {{ 'en' | displayNames : 'script' }}
		</p>
		<p>
			<strong ngNonBindable>{{ 'en' | displayNames : 'region' }}</strong>
			=> {{ 'en' | displayNames : 'region' }}
		</p>
	`,
	host: {
		style: 'display: block',
	},
})
export default class IntlComponent {}
