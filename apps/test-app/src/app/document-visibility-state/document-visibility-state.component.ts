import { Component, effect } from '@angular/core';
import { injectDocumentVisibility } from 'ngxtension/inject-document-visibility';

@Component({
	template: `
		{{ visibilityState() }}
	`,
	standalone: true,
})
export default class DocumentVisibilityStateComponent {
	visibilityState = injectDocumentVisibility();

	constructor() {
		effect(() => {
			console.log(this.visibilityState());
		});
	}
}
