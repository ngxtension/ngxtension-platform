import {
	Component,
	inject,
	Injector,
	numberAttribute,
	Signal,
} from '@angular/core';
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
		expect(instance.userIdCustomInjector!()).toEqual('angular');
		expect(instance.paramKeysList()).toEqual(['id']);

		await harness.navigateByUrl('/user/test', UserProfileComponent);

		expect(instance.params()).toEqual({ id: 'test' });
		expect(instance.userId()).toEqual('test');
		expect(instance.userIdCustomInjector!()).toEqual('test');
		expect(instance.paramKeysList()).toEqual(['id']);
	});

	it('returns a signal everytime the route params change based on the param id and transform option', async () => {
		TestBed.configureTestingModule({
			providers: [
				provideRouter([
					{ path: 'post/:id', component: PostComponent },
					{ path: 'post', component: PostComponent },
				]),
			],
		});

		const harness = await RouterTestingHarness.create();

		const instanceNull = await harness.navigateByUrl('/post', PostComponent);

		expect(instanceNull.postId()).toEqual(null);
		expect(instanceNull.postIdDefault()).toEqual(69);

		const instance = await harness.navigateByUrl('/post/420', PostComponent);

		expect(instance.postId()).toEqual(420);
		expect(instance.postIdDefault()).toEqual(420);

		await harness.navigateByUrl('/post/test', PostComponent);

		expect(instance.postId()).toEqual(NaN);
		expect(instance.postIdDefault()).toEqual(NaN);
	});
});

@Component({
	standalone: true,
	template: ``,
})
export class UserProfileComponent {
	private _injector = inject(Injector);

	params = injectParams();
	userId = injectParams('id');
	paramKeysList = injectParams((params) => Object.keys(params));

	userIdCustomInjector?: Signal<string | null>;

	constructor() {
		this.userIdCustomInjector = injectParams('id', {
			injector: this._injector,
		});
	}
}

@Component({
	standalone: true,
	template: ``,
})
export class PostComponent {
	postId = injectParams('id', { transform: numberAttribute });
	postIdDefault = injectParams('id', {
		transform: numberAttribute,
		defaultValue: 69,
	});
}
