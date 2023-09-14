import { Component } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { interval, tap } from 'rxjs';
import { createEffect } from './create-effect';

describe(createEffect.name, () => {
	@Component({
		standalone: true,
		template: '',
	})
	class Foo {
		count = 0;
		log = createEffect<number>(tap(() => (this.count += 1)));

		ngOnInit() {
			this.log(interval(1000));
		}
	}

	it('should run until component is destroyed', fakeAsync(() => {
		const fixture = TestBed.createComponent(Foo);
		const component = fixture.componentInstance;
		fixture.detectChanges();
		expect(component.count).toEqual(0);

		tick(1000);
		expect(component.count).toEqual(1);

		tick(1000);
		expect(component.count).toEqual(2);

		fixture.destroy();
		tick(1000);
		expect(component.count).toEqual(2);
	}));
});
