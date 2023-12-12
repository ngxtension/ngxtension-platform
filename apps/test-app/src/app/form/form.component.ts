import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgxForm } from './chau-form';

@Component({
	standalone: true,
	template: `
		<h1>Hi Form</h1>
		<form ngxForm>
			<input type="text" name="firstName" />
			<input type="text" name="lastName" />
		</form>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [NgxForm],
	host: { class: 'form' },
})
export default class Form {}
