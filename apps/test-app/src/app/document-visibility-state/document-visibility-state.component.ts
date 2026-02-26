import { Component, effect } from '@angular/core';
import { injectDocumentVisibility } from 'ngxtension/inject-document-visibility';

@Component({
	template: `
		{{ visibilityState() }}
	`,
})
export default class DocumentVisibilityStateComponent {
	visibilityState = injectDocumentVisibility();

	constructor() {
		effect(() => {
			console.log(this.visibilityState());
		});
	}
}
