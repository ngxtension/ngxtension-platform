import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { explicitAfterRenderEffect } from './explicit-after-render-effect';

describe(explicitAfterRenderEffect.name, () => {
	describe('convenience (single-phase) overload', () => {
		@Component({ standalone: true, template: '' })
		class Host {
			tracked = signal(0);
			untracked = signal('idle');

			runs: Array<{ tracked: number; untracked: string }> = [];
			cleanups = 0;

			ref = explicitAfterRenderEffect([this.tracked], ([tracked], cleanup) => {
				this.runs.push({ tracked, untracked: this.untracked() });
				cleanup(() => {
					this.cleanups += 1;
				});
			});
		}

		it('runs after first render and re-runs only when listed deps change', () => {
			const fixture = TestBed.createComponent(Host);
			fixture.autoDetectChanges();
			const c = fixture.componentInstance;

			expect(c.runs.length).toBe(1);
			expect(c.runs[0]).toEqual({ tracked: 0, untracked: 'idle' });
			expect(c.cleanups).toBe(0);

			c.tracked.set(1);
			fixture.detectChanges();
			expect(c.runs.length).toBe(2);
			expect(c.runs[1].tracked).toBe(1);
			expect(c.cleanups).toBe(1);

			c.untracked.set('busy');
			fixture.detectChanges();
			expect(c.runs.length).toBe(2);
			expect(c.cleanups).toBe(1);
		});

		it('stops running after destroy()', () => {
			const fixture = TestBed.createComponent(Host);
			fixture.autoDetectChanges();
			const c = fixture.componentInstance;
			expect(c.runs.length).toBe(1);

			c.ref.destroy();

			c.tracked.set(42);
			fixture.detectChanges();
			expect(c.runs.length).toBe(1);
		});

		it('forwards an onCleanup callback to the user function', () => {
			@Component({ standalone: true, template: '' })
			class CleanupHost {
				input = signal(0);
				registered = 0;

				cleanupCalls = 0;

				ref = explicitAfterRenderEffect([this.input], (_deps, cleanup) => {
					expect(typeof cleanup).toBe('function');
					cleanup(() => {
						this.cleanupCalls += 1;
					});
					this.registered += 1;
				});
			}

			const fixture = TestBed.createComponent(CleanupHost);
			fixture.autoDetectChanges();
			expect(fixture.componentInstance.registered).toBe(1);
		});
	});

	describe('spec (multi-phase) overload', () => {
		it('forwards resolved deps to each phase and chains prev between phases', () => {
			@Component({ standalone: true, template: '' })
			class Host {
				input = signal(10);

				phaseLog: string[] = [];
				earlyReadSawDeps: number | undefined;
				writeSawPrev: number | undefined;
				mixedReadWriteSawPrev: number | undefined;
				readSawPrev: number | undefined;

				ref = explicitAfterRenderEffect([this.input], {
					earlyRead: ([input]) => {
						this.phaseLog.push('earlyRead');
						this.earlyReadSawDeps = input;
						return input + 1;
					},
					write: (_deps, prev) => {
						this.phaseLog.push('write');
						this.writeSawPrev = prev?.();
						return (prev?.() ?? 0) + 1;
					},
					mixedReadWrite: (_deps, prev) => {
						this.phaseLog.push('mixedReadWrite');
						this.mixedReadWriteSawPrev = prev?.();
						return (prev?.() ?? 0) + 1;
					},
					read: (_deps, prev) => {
						this.phaseLog.push('read');
						this.readSawPrev = prev?.();
					},
				});
			}

			const fixture = TestBed.createComponent(Host);
			fixture.autoDetectChanges();
			const c = fixture.componentInstance;

			expect(c.phaseLog).toEqual([
				'earlyRead',
				'write',
				'mixedReadWrite',
				'read',
			]);
			expect(c.earlyReadSawDeps).toBe(10);
			expect(c.writeSawPrev).toBe(11);
			expect(c.mixedReadWriteSawPrev).toBe(12);
			expect(c.readSawPrev).toBe(13);
		});

		it('omitted phases are not registered', () => {
			@Component({ standalone: true, template: '' })
			class Host {
				input = signal(0);
				readRuns = 0;

				ref = explicitAfterRenderEffect([this.input], {
					read: () => {
						this.readRuns += 1;
					},
				});
			}

			const fixture = TestBed.createComponent(Host);
			fixture.autoDetectChanges();
			const c = fixture.componentInstance;

			expect(c.readRuns).toBe(1);

			c.input.set(1);
			fixture.detectChanges();
			expect(c.readRuns).toBe(2);
		});
	});

	it('accepts signal-reading functions in the deps tuple', () => {
		@Component({ standalone: true, template: '' })
		class Host {
			a = signal(1);
			b = signal(2);
			runs: number[] = [];

			ref = explicitAfterRenderEffect([() => this.a() + this.b()], ([sum]) => {
				this.runs.push(sum);
			});
		}

		const fixture = TestBed.createComponent(Host);
		fixture.autoDetectChanges();
		const c = fixture.componentInstance;

		expect(c.runs).toEqual([3]);

		c.a.set(5);
		fixture.detectChanges();
		expect(c.runs).toEqual([3, 7]);
	});
});
