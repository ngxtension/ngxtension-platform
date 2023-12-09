import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { injectParams } from './inject-params';

describe(injectParams.name, () => {
	it('returns a signal everytime the route params change based on the param passed to the fn', async () => {
		TestBed.configureTestingModule({
			providers: [
				provideRouter([{ path: 'user/:id', component: UserProfileComponent }]),
			],
		});

		const harness = await RouterTestingHarness.create();

		const instance = await harness.navigateByUrl(
			'/user/angular',
			UserProfileComponent,
		);

		expect(instance.params()).toEqual({ id: 'angular' });
		expect(instance.userId()).toEqual('angular');
		expect(instance.paramKeysList()).toEqual(['id']);
	});
});

@Component({
	standalone: true,
	template: ``,
})
export class UserProfileComponent {
	params = injectParams();
	userId = injectParams('id');
	paramKeysList = injectParams((params) => Object.keys(params));
}
