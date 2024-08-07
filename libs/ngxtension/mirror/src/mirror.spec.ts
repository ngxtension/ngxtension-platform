import { Component, input, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { mirror } from './mirror';

describe(mirror.name, () => {
	it('should work with signals', () => {
		const value = signal(1);
		const mirrored = mirror(value);

		expect(mirrored()).toEqual(1);

		value.set(2);
		expect(mirrored()).toEqual(2);

		mirrored.set(3);
		expect(mirrored()).toEqual(3);
		expect(value()).toEqual(2); // value should not change

		value.set(4);
		expect(mirrored()).toEqual(4);
		expect(value()).toEqual(4);

		mirrored.set(5);
		expect(mirrored()).toEqual(5);
		expect(value()).toEqual(4); // value should not change
	});

	it('should work with inputs', () => {
		@Component({ standalone: true, template: `` })
		class TestCmp {
			value = input(1);
			mirrored = mirror(this.value);
		}
		const fixture = TestBed.createComponent(TestCmp);
		fixture.detectChanges();

		expect(fixture.componentInstance.mirrored()).toEqual(1);

		fixture.componentRef.setInput('value', 2);
		fixture.detectChanges();
		expect(fixture.componentInstance.mirrored()).toEqual(2);

		fixture.componentInstance.mirrored.set(3);
		fixture.detectChanges();
		expect(fixture.componentInstance.mirrored()).toEqual(3);
		expect(fixture.componentInstance.value()).toEqual(2); // value should not change

		fixture.componentRef.setInput('value', 4);
		fixture.detectChanges();
		expect(fixture.componentInstance.mirrored()).toEqual(4);
		expect(fixture.componentInstance.value()).toEqual(4);
	});

	it('should work with required inputs', () => {
		@Component({
			standalone: true,
			template: `
				{{ mirrored() }}
			`,
		})
		class TestCmp {
			value = input.required<number>();
			mirrored = mirror(this.value);
		}
		const fixture = TestBed.createComponent(TestCmp);
		fixture.componentRef.setInput('value', 2);
		fixture.detectChanges();

		expect(fixture.componentInstance.mirrored()).toEqual(2);
		fixture.componentRef.setInput('value', 3);
		fixture.detectChanges();
		expect(fixture.componentInstance.mirrored()).toEqual(3);

		fixture.componentInstance.mirrored.set(4);
		fixture.detectChanges();
		expect(fixture.componentInstance.mirrored()).toEqual(4);
		expect(fixture.componentInstance.value()).toEqual(3); // value should not change
	});

	it('should work with expressions', async () => {
		@Component({
			standalone: true,
			template: `
				{{ mirrored() }}
			`,
		})
		class TestCmp {
			value = input.required<number>();
			mirrored = mirror(() => this.value() + 1);
		}
		const fixture = TestBed.createComponent(TestCmp);
		fixture.componentRef.setInput('value', 2);
		await fixture.whenStable();

		expect(fixture.componentInstance.mirrored()).toEqual(3);
		fixture.componentRef.setInput('value', 3);
		await fixture.whenStable();
		expect(fixture.componentInstance.mirrored()).toEqual(4);

		fixture.componentInstance.mirrored.set(5);
		await fixture.whenStable();
		expect(fixture.componentInstance.mirrored()).toEqual(5);
		expect(fixture.componentInstance.value()).toEqual(3); // value should not change
	});
});
