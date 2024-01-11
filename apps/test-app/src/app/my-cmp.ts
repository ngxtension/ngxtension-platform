import { Component, Input, booleanAttribute } from '@angular/core';

@Component({
	standalone: true,
	template: ``,
})
export class MyCmp {
	@Input() withDefault = '';
	@Input({ required: true }) requiredInput!: string;
	@Input({ required: true, alias: 'requiredAlias' }) requiredWithAlias!: number;
	@Input({
		required: true,
		alias: 'transformedRequiredAlias',
		transform: booleanAttribute,
	})
	requiredWithAliasTransform!: boolean | '';
	@Input() withoutDefault?: string;
	@Input() withoutDefaultUndefined: string | undefined;
	@Input('theAlias') withAlias = '';
	@Input({ alias: 'theAliasNoRequired' }) withAliasNoRequired?: string;
	// with comment
	@Input() withComment = 'with Comment';

	/**
	 * @description This is with jsdoc
	 */
	@Input() withJsDoc = 'with jsdoc';

	@Input() set shouldBeSkipped(value: number) {
		console.log('blah', value);
	}
}
