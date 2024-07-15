import { Component, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { mergeInputs } from './merge-inputs';

describe(mergeInputs.name, () => {
	const defaultOptions = {
		foo: 'default foo',
		bar: 123,
	};

	@Component({
		standalone: true,
		template: ``,
	})
	class Foo {
		mergeOptions = input(defaultOptions, {
			transform: mergeInputs(defaultOptions),
		});
		noMergeOptions = input(defaultOptions);
	}

	function setup() {
		const fixture = TestBed.createComponent(Foo);
		fixture.detectChanges();

		return [fixture, fixture.componentInstance] as const;
	}

	it('should merge inputs', () => {
		const [fixture, component] = setup();

		fixture.componentRef.setInput('mergeOptions', { foo: 'updated foo' });
		fixture.detectChanges();

		expect(component.mergeOptions()).toEqual({ foo: 'updated foo', bar: 123 });
	});

	it('should not merge inputs without transform', () => {
		const [fixture, component] = setup();

		fixture.componentRef.setInput('noMergeOptions', { foo: 'updated foo' });
		fixture.detectChanges();

		expect(component.noMergeOptions()).toEqual({ foo: 'updated foo' });
	});
});
