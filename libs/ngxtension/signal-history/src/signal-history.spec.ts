import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { signalHistory } from './signal-history';

describe(signalHistory.name, () => {
	@Component({ standalone: true, template: '' })
	class Foo {
		withString = signal('');
		withNumber = signal(0);
		withBoolean = signal(false);
		withObject = signal({});
		withArray = signal<string[]>([]);

		withStringHistory = signalHistory(this.withString);
		withNumberHistory = signalHistory(this.withNumber);
		withBooleanHistory = signalHistory(this.withBoolean);
		withObjectHistory = signalHistory(this.withObject);
		withArrayHistory = signalHistory(this.withArray);
	}

	it('should work for strings', () => {
		const fixture = TestBed.createComponent(Foo);
		fixture.detectChanges();

		expect(fixture.componentInstance.withStringHistory.history().length).toBe(
			1,
		);
		expect(fixture.componentInstance.withStringHistory.canUndo()).toBe(false);
		expect(fixture.componentInstance.withStringHistory.canRedo()).toBe(false);

		fixture.componentInstance.withString.set('foo');
		fixture.detectChanges();

		const history = fixture.componentInstance.withStringHistory.history();
		expect(history.length).toBe(2);
		expect(history[0].value).toBe('');
		expect(history[1].value).toBe('foo');

		expect(fixture.componentInstance.withStringHistory.canUndo()).toBe(true);
		expect(fixture.componentInstance.withStringHistory.canRedo()).toBe(false);

		fixture.componentInstance.withStringHistory.undo();
		fixture.detectChanges();

		expect(fixture.componentInstance.withStringHistory.history().length).toBe(
			1,
		);
		expect(fixture.componentInstance.withStringHistory.canUndo()).toBe(false);
		expect(fixture.componentInstance.withStringHistory.canRedo()).toBe(true);

		fixture.componentInstance.withStringHistory.redo();
		fixture.detectChanges();

		expect(fixture.componentInstance.withStringHistory.history().length).toBe(
			2,
		);
	});

	fit('should work for numbers', () => {
		const fixture = TestBed.createComponent(Foo);
		fixture.detectChanges();

		const history = () => fixture.componentInstance.withNumberHistory.history();
		const canUndo = () => fixture.componentInstance.withNumberHistory.canUndo();
		const canRedo = () => fixture.componentInstance.withNumberHistory.canRedo();

		expect(history().length).toBe(1);
		expect(history()[0].value).toBe(0);
		expect(canUndo()).toBe(false);
		expect(canRedo()).toBe(false);

		fixture.componentInstance.withNumber.set(1);
		fixture.detectChanges();

		expect(history().length).toBe(2);
		expect(history()[0].value).toBe(0);
		expect(history()[1].value).toBe(1);

		expect(canUndo()).toBe(true);
		expect(canRedo()).toBe(false);

		fixture.componentInstance.withNumberHistory.undo();
		fixture.detectChanges();

		expect(history().length).toBe(1);
		expect(history()[0].value).toBe(0);
		expect(canUndo()).toBe(false);
		expect(canRedo()).toBe(true);

		fixture.componentInstance.withNumberHistory.redo();
		fixture.detectChanges();
		expect(history().length).toBe(2);
		expect(history()[0].value).toBe(0);
		expect(history()[1].value).toBe(1);

		expect(canUndo()).toBe(true);
		expect(canRedo()).toBe(false);

		fixture.componentInstance.withNumberHistory.undo();
		fixture.detectChanges();

		expect(history().length).toBe(1);
		expect(history()[0].value).toBe(0);
		expect(canUndo()).toBe(false);
		expect(canRedo()).toBe(true);

		fixture.componentInstance.withNumberHistory.redo();
		fixture.detectChanges();

		expect(history().length).toBe(2);
		expect(history()[0].value).toBe(0);
		expect(history()[1].value).toBe(1);
	});

	it('should work for booleans', () => {
		const fixture = TestBed.createComponent(Foo);
		fixture.detectChanges();

		expect(fixture.componentInstance.withBooleanHistory.history().length).toBe(
			1,
		);
		expect(fixture.componentInstance.withBooleanHistory.canUndo()).toBe(false);
		expect(fixture.componentInstance.withBooleanHistory.canRedo()).toBe(false);

		fixture.componentInstance.withBoolean.set(true);
		fixture.detectChanges();

		const history = fixture.componentInstance.withBooleanHistory.history();
		expect(history.length).toBe(2);
		expect(history[0].value).toBe(false);
		expect(history[1].value).toBe(true);

		expect(fixture.componentInstance.withBooleanHistory.canUndo()).toBe(true);
		expect(fixture.componentInstance.withBooleanHistory.canRedo()).toBe(false);

		fixture.componentInstance.withBooleanHistory.undo();
		fixture.detectChanges();

		expect(fixture.componentInstance.withBooleanHistory.history().length).toBe(
			1,
		);
		expect(fixture.componentInstance.withBooleanHistory.canUndo()).toBe(false);
		expect(fixture.componentInstance.withBooleanHistory.canRedo()).toBe(true);

		fixture.componentInstance.withBooleanHistory.redo();
		fixture.detectChanges();

		expect(fixture.componentInstance.withBooleanHistory.history().length).toBe(
			2,
		);
		expect(fixture.componentInstance.withBooleanHistory.canUndo()).toBe(true);
		expect(fixture.componentInstance.withBooleanHistory.canRedo()).toBe(false);

		fixture.componentInstance.withBooleanHistory.undo();
		fixture.detectChanges();

		expect(fixture.componentInstance.withBooleanHistory.history().length).toBe(
			1,
		);
		expect(fixture.componentInstance.withBooleanHistory.canUndo()).toBe(false);
		expect(fixture.componentInstance.withBooleanHistory.canRedo()).toBe(true);

		fixture.componentInstance.withBooleanHistory.redo();
		fixture.detectChanges();

		expect(fixture.componentInstance.withBooleanHistory.history().length).toBe(
			2,
		);
	});

	it('should work for objects', () => {
		const fixture = TestBed.createComponent(Foo);
		fixture.detectChanges();

		expect(fixture.componentInstance.withObjectHistory.history().length).toBe(
			1,
		);
		expect(fixture.componentInstance.withObjectHistory.canUndo()).toBe(false);
		expect(fixture.componentInstance.withObjectHistory.canRedo()).toBe(false);

		fixture.componentInstance.withObject.set({ foo: 'bar' });
		fixture.detectChanges();

		const history = fixture.componentInstance.withObjectHistory.history();
		expect(history.length).toBe(2);
		expect(history[0].value).toEqual({});
		expect(history[1].value).toEqual({ foo: 'bar' });

		expect(fixture.componentInstance.withObjectHistory.canUndo()).toBe(true);
		expect(fixture.componentInstance.withObjectHistory.canRedo()).toBe(false);

		fixture.componentInstance.withObjectHistory.undo();
		fixture.detectChanges();

		expect(fixture.componentInstance.withObjectHistory.history().length).toBe(
			1,
		);
		expect(fixture.componentInstance.withObjectHistory.canUndo()).toBe(false);
		expect(fixture.componentInstance.withObjectHistory.canRedo()).toBe(true);

		fixture.componentInstance.withObjectHistory.redo();
		fixture.detectChanges();

		expect(fixture.componentInstance.withObjectHistory.history().length).toBe(
			2,
		);
		expect(fixture.componentInstance.withObjectHistory.canUndo()).toBe(true);
		expect(fixture.componentInstance.withObjectHistory.canRedo()).toBe(false);

		fixture.componentInstance.withObjectHistory.undo();
		fixture.detectChanges();

		expect(fixture.componentInstance.withObjectHistory.history().length).toBe(
			1,
		);
		expect(fixture.componentInstance.withObjectHistory.canUndo()).toBe(false);
		expect(fixture.componentInstance.withObjectHistory.canRedo()).toBe(true);

		fixture.componentInstance.withObjectHistory.redo();
		fixture.detectChanges();

		expect(fixture.componentInstance.withObjectHistory.history().length).toBe(
			2,
		);
	});

	it('should work for arrays', () => {
		const fixture = TestBed.createComponent(Foo);
		fixture.detectChanges();

		expect(fixture.componentInstance.withArrayHistory.history().length).toBe(1);
		expect(fixture.componentInstance.withArrayHistory.canUndo()).toBe(false);
		expect(fixture.componentInstance.withArrayHistory.canRedo()).toBe(false);

		fixture.componentInstance.withArray.set(['foo']);
		fixture.detectChanges();

		const history = fixture.componentInstance.withArrayHistory.history();
		expect(history.length).toBe(2);
		expect(history[0].value).toEqual([]);
		expect(history[1].value).toEqual(['foo']);

		expect(fixture.componentInstance.withArrayHistory.canUndo()).toBe(true);
		expect(fixture.componentInstance.withArrayHistory.canRedo()).toBe(false);

		fixture.componentInstance.withArrayHistory.undo();
		fixture.detectChanges();

		expect(fixture.componentInstance.withArrayHistory.history().length).toBe(1);
		expect(fixture.componentInstance.withArrayHistory.canUndo()).toBe(false);
		expect(fixture.componentInstance.withArrayHistory.canRedo()).toBe(true);

		fixture.componentInstance.withArrayHistory.redo();
		fixture.detectChanges();

		expect(fixture.componentInstance.withArrayHistory.history().length).toBe(2);
		expect(fixture.componentInstance.withArrayHistory.canUndo()).toBe(true);
		expect(fixture.componentInstance.withArrayHistory.canRedo()).toBe(false);

		fixture.componentInstance.withArrayHistory.undo();
		fixture.detectChanges();

		expect(fixture.componentInstance.withArrayHistory.history().length).toBe(1);
		expect(fixture.componentInstance.withArrayHistory.canUndo()).toBe(false);
		expect(fixture.componentInstance.withArrayHistory.canRedo()).toBe(true);

		fixture.componentInstance.withArrayHistory.redo();
		fixture.detectChanges();

		expect(fixture.componentInstance.withArrayHistory.history().length).toBe(2);
	});
});
