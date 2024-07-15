import { Component, computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { explicitEffect } from './explicit-effect';

describe(explicitEffect.name, () => {
	let log: string[] = [];
	let cleanupLog: string[] = [];

	beforeEach(() => {
		log = [];
		cleanupLog = [];
	});

	@Component({
		standalone: true,
		template: '',
	})
	class Foo {
		count = signal(0);
		state = signal('idle');
		foobar = signal<'foo' | 'bar'>('foo');

		eff = explicitEffect(
			[this.count, this.state],
			([count, state], cleanUpFn) => {
				this.foobar();
				log.push(`count updated ${count}, ${state}`);

				cleanUpFn(() => {
					cleanupLog.push('cleanup');
				});
			},
		);
	}

	it('should register deps and run effect', () => {
		const fixture = TestBed.createComponent(Foo);
		fixture.detectChanges();
		expect(log.length).toBe(1);

		fixture.componentInstance.count.set(1);
		fixture.detectChanges();
		expect(log.length).toBe(2);
	});

	it('should not run when unresgistered dep', () => {
		const fixture = TestBed.createComponent(Foo);
		fixture.detectChanges();
		expect(log.length).toBe(1);

		fixture.componentInstance.foobar.set('foo');
		fixture.detectChanges();
		expect(log.length).toBe(1);
	});

	it('should run the effect cleanupFn', () => {
		const fixture = TestBed.createComponent(Foo);
		expect(log.length).toBe(0);
		fixture.detectChanges();
		expect(log.length).toBe(1);
		expect(cleanupLog.length).toBe(0);

		fixture.componentInstance.count.set(1);
		TestBed.flushEffects();
		expect(log.length).toBe(2);
		expect(cleanupLog.length).toBe(1);
	});

	it('should accept computed, functions etc.', () => {
		const log: string[] = [];
		const count = signal(0);
		const state = signal('idle');
		const doubleCount = computed(() => count() * 2);
		const foobar = signal<'foo' | 'bar'>('foo');
		const result = () => count() + doubleCount() + foobar();

		TestBed.runInInjectionContext(() => {
			explicitEffect(
				[count, state, doubleCount, result],
				([count, state, doubleCount, result]) => {
					log.push(
						`count updated ${count}, ${state}, ${doubleCount}, ${result}`,
					);
				},
			);
			expect(log.length).toBe(0);
			TestBed.flushEffects();
			expect(log.length).toBe(1);

			foobar.set('bar');
			TestBed.flushEffects();
			expect(log.length).toBe(2);
			expect(log.some((v) => v.includes('bar'))).toBeTruthy();
		});
	});

	it('should pass the right types to the effect callback', () => {
		const count = signal(0);
		const state = signal('idle');

		TestBed.runInInjectionContext(() => {
			explicitEffect([count, state], ([count, state]) => {
				const _count: number = count;
				const _state: string = state;
				console.log(_count, _state);
			});
		});
	});

	it('should skip the first run of the effect callback', () => {
		const log: string[] = [];
		const count = signal(0);
		const state = signal('idle');

		TestBed.runInInjectionContext(() => {
			explicitEffect(
				[count, state],
				([count, state]) => {
					log.push(`count updated ${count}, ${state}`);
				},
				{ defer: true },
			);
			expect(log.length).toBe(0);
			TestBed.flushEffects();
			expect(log.length).toBe(0);

			count.set(1);
			TestBed.flushEffects();
			expect(log.length).toBe(1);
		});
	});
});
