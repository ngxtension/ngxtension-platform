import { Component, computed, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { injectInputs } from './inject-inputs';

describe(injectInputs.name, () => {
	@Component({ standalone: true, template: '' })
	class Foo {
		foo = input(1);
		bar = input('bar');

		inputs = injectInputs(this, Foo);
		computedCount = 0;
	}

	function setup() {
		const fixture = TestBed.createComponent(Foo);
		const doubleFoo = computed(() => {
			fixture.componentInstance.computedCount += 1;
			return fixture.componentInstance.inputs().foo * 2;
		});
		return [fixture, doubleFoo] as const;
	}

	it('should work', () => {
		const [fixture, doubleFoo] = setup();
		const cmp = fixture.componentInstance;

		expect(cmp.inputs()).toEqual({ foo: 1, bar: 'bar' });
		expect(doubleFoo()).toEqual(2);
		// computed calculates
		expect(cmp.computedCount).toEqual(1);

		fixture.componentRef.setInput('bar', 'updated');
		fixture.detectChanges();

		expect(cmp.inputs()).toEqual({ foo: 1, bar: 'updated' });
		// computed should not recalculate
		expect(cmp.computedCount).toEqual(1);
		expect(doubleFoo()).toEqual(2);

		fixture.componentRef.setInput('foo', 2);
		fixture.detectChanges();

		expect(cmp.inputs()).toEqual({ foo: 2, bar: 'updated' });
		// computed should recalculate
		expect(cmp.computedCount).toEqual(2);
		expect(doubleFoo()).toEqual(4);
	});
});
