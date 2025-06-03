import { computed, input, signal, ɵInputSignalNode } from '@angular/core';
import { SIGNAL } from '@angular/core/primitives/signals';
import { TestBed } from '@angular/core/testing';
import { computedPrevious } from './computed-previous';

interface TestFixture {
	value: () => number;
	setValue: (value: number) => void;
}

function setupSignal(): TestFixture {
	const value = signal(0);

	return {
		value,
		setValue: (newValue: number) => value.set(newValue),
	};
}

function setupComputed(spy: jest.Mock): TestFixture {
	const value = signal(0);
	const computedValue = computed(() => {
		spy();
		return value();
	});

	return {
		value: computedValue,
		setValue: (newValue: number) => value.set(newValue),
	};
}

function setupInput(): TestFixture {
	const value = TestBed.runInInjectionContext(() => input(0));

	return {
		value,
		setValue: (newValue: number) => {
			const reactiveNode = value[SIGNAL] as ɵInputSignalNode<number, number>;

			reactiveNode.applyValueToInputSignal(reactiveNode, newValue);
		},
	};
}

function setupRequiredInput(): TestFixture {
	const value = TestBed.runInInjectionContext(() => input.required<number>());

	return {
		value,
		setValue: (newValue: number) => {
			const reactiveNode = value[SIGNAL] as ɵInputSignalNode<number, number>;

			reactiveNode.applyValueToInputSignal(reactiveNode, newValue);
		},
	};
}

describe(computedPrevious.name, () => {
	it('should work properly with signal', () => {
		const { value, setValue } = setupSignal();
		const previous = computedPrevious(value);

		expect(value()).toEqual(0);
		expect(previous()).toEqual(0);

		setValue(1);

		expect(value()).toEqual(1);
		expect(previous()).toEqual(0);

		setValue(2);

		expect(value()).toEqual(2);
		expect(previous()).toEqual(1);

		setValue(2);

		expect(value()).toEqual(2);
		expect(previous()).toEqual(1);

		setValue(3);

		expect(value()).toEqual(3);
		expect(previous()).toEqual(2);
	});

	it('should work properly with computed', () => {
		const computedSpy = jest.fn();
		const { value, setValue } = setupComputed(computedSpy);
		const previous = computedPrevious(value);

		expect(computedSpy).not.toHaveBeenCalled();

		expect(value()).toEqual(0);
		expect(previous()).toEqual(0);

		expect(computedSpy).toHaveBeenCalled();

		setValue(1);

		expect(value()).toEqual(1);
		expect(previous()).toEqual(0);

		setValue(2);

		expect(value()).toEqual(2);
		expect(previous()).toEqual(1);

		setValue(2);

		expect(value()).toEqual(2);
		expect(previous()).toEqual(1);

		setValue(3);

		expect(value()).toEqual(3);
		expect(previous()).toEqual(2);
	});

	it('should work properly with input', () => {
		const { value, setValue } = setupInput();
		const previous = computedPrevious(value);

		expect(value()).toEqual(0);
		expect(previous()).toEqual(0);

		setValue(1);

		expect(value()).toEqual(1);
		expect(previous()).toEqual(0);

		setValue(2);

		expect(value()).toEqual(2);
		expect(previous()).toEqual(1);

		setValue(2);

		expect(value()).toEqual(2);
		expect(previous()).toEqual(1);

		setValue(3);

		expect(value()).toEqual(3);
		expect(previous()).toEqual(2);
	});

	it('should work properly with required input', () => {
		const { value, setValue } = setupRequiredInput();
		const previous = computedPrevious(value);

		expect(value).toThrow(
			`NG0950: Input is required but no value is available yet. Find more at https://angular.dev/errors/NG0950`,
		);
		expect(previous).toThrow(
			`NG0950: Input is required but no value is available yet. Find more at https://angular.dev/errors/NG0950`,
		);

		setValue(1);

		expect(value()).toEqual(1);
		expect(previous()).toEqual(1);

		setValue(2);

		expect(value()).toEqual(2);
		expect(previous()).toEqual(1);

		setValue(2);

		expect(value()).toEqual(2);
		expect(previous()).toEqual(1);

		setValue(3);

		expect(value()).toEqual(3);
		expect(previous()).toEqual(2);
	});
});
