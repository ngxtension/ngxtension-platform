import { Component } from '@angular/core';
import {
	ComponentFixture,
	TestBed,
	fakeAsync,
	tick,
} from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { delay, of } from 'rxjs';
import { injectNavigationEnd } from './navigation-end';

describe(injectNavigationEnd.name, () => {
	@Component({
		standalone: true,
		template: '',
	})
	class Foo {
		count = 0;
		navigationEnd$ = injectNavigationEnd();

		ngOnInit() {
			this.navigationEnd$.pipe(delay(0)).subscribe(() => {
				this.count = 1;
			});
		}
	}

	let component: Foo;
	let fixture: ComponentFixture<Foo>;
	beforeEach(() => {
		TestBed.overrideProvider(Router, {
			useValue: {
				events: of(new NavigationEnd(0, '', '')),
			},
		});
		fixture = TestBed.createComponent(Foo);
		fixture.autoDetectChanges();
		component = fixture.componentInstance;
	});

	it('should modify "count" when router NavigationEnd event occur', fakeAsync(() => {
		component.ngOnInit();
		expect(component.count).toBe(0);
		tick(100);
		expect(component.count).toBe(1);

		fixture.destroy(); // destroy the component here

		tick(500);
		expect(component.count).toBe(1);
	}));
});
