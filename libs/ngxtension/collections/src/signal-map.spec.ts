import { computed, effect, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SignalMap } from './signal-map';

describe('SignalMap', () => {
	describe('constructor', () => {
		it('should create an empty map when no entries provided', () => {
			const map = new SignalMap<string, number>();
			expect(map.size).toBe(0);
		});

		it('should create a map with initial entries', () => {
			const map = new SignalMap<string, number>([
				['a', 1],
				['b', 2],
				['c', 3],
			]);
			expect(map.size).toBe(3);
			expect(map.get('a')).toBe(1);
			expect(map.get('b')).toBe(2);
			expect(map.get('c')).toBe(3);
		});

		it('should handle null entries', () => {
			const map = new SignalMap<string, number>(null);
			expect(map.size).toBe(0);
		});

		it('should support undefined as a value', () => {
			const map = new SignalMap<string, undefined>([
				['a', undefined],
				['b', undefined],
			]);
			expect(map.size).toBe(2);
			expect(map.get('a')).toBe(undefined);
			expect(map.has('a')).toBe(true);
		});
	});

	describe('get', () => {
		it('should return the value for an existing key', () => {
			const map = new SignalMap<string, number>();
			map.set('a', 1);
			expect(map.get('a')).toBe(1);
		});

		it('should return undefined for a non-existent key', () => {
			const map = new SignalMap<string, number>();
			expect(map.get('nonexistent')).toBe(undefined);
		});

		it('should track value changes in computed', () => {
			const map = new SignalMap<string, number>();
			map.set('a', 1);

			const value = computed(() => map.get('a'));
			expect(value()).toBe(1);

			map.set('a', 2);
			expect(value()).toBe(2);
		});

		it('should track key addition in computed', () => {
			const map = new SignalMap<string, number>();

			const value = computed(() => map.get('a') ?? 0);
			expect(value()).toBe(0);

			map.set('a', 5);
			expect(value()).toBe(5);
		});

		it('should track key deletion in computed', () => {
			const map = new SignalMap<string, number>();
			map.set('a', 1);

			const value = computed(() => map.get('a') ?? 0);
			expect(value()).toBe(1);

			map.delete('a');
			expect(value()).toBe(0);
		});

		it('should support null and undefined values correctly', () => {
			const map = new SignalMap<string, number | null | undefined>();
			map.set('a', null);
			map.set('b', undefined);
			map.set('c', 0);

			expect(map.get('a')).toBe(null);
			expect(map.get('b')).toBe(undefined);
			expect(map.get('c')).toBe(0);
			expect(map.has('a')).toBe(true);
			expect(map.has('b')).toBe(true);
			expect(map.has('c')).toBe(true);
		});
	});

	describe('set', () => {
		it('should add a new key-value pair', () => {
			const map = new SignalMap<string, number>();
			map.set('a', 1);
			expect(map.get('a')).toBe(1);
			expect(map.size).toBe(1);
		});

		it('should update an existing key without triggering structure change', () => {
			const map = new SignalMap<string, number>();
			map.set('a', 1);

			let structureChanges = 0;
			const sizeComputed = computed(() => {
				structureChanges++;
				return map.size;
			});

			// Initial read
			expect(sizeComputed()).toBe(1);
			structureChanges = 0;

			// Update existing key should not trigger structure change
			map.set('a', 2);
			expect(map.get('a')).toBe(2);
			expect(structureChanges).toBe(0);
		});

		it('should return this for chaining', () => {
			const map = new SignalMap<string, number>();
			const result = map.set('a', 1).set('b', 2).set('c', 3);
			expect(result).toBe(map);
			expect(map.size).toBe(3);
		});

		it('should trigger effects when setting new keys', () => {
			TestBed.runInInjectionContext(() => {
				const map = new SignalMap<string, number>();
				const logs: number[] = [];

				effect(() => {
					logs.push(map.size);
				});

				TestBed.flushEffects();
				expect(logs).toEqual([0]);

				map.set('a', 1);
				TestBed.flushEffects();
				expect(logs).toEqual([0, 1]);

				map.set('b', 2);
				TestBed.flushEffects();
				expect(logs).toEqual([0, 1, 2]);
			});
		});

		it('should trigger effects when updating existing keys', () => {
			TestBed.runInInjectionContext(() => {
				const map = new SignalMap<string, number>();
				map.set('a', 1);

				const logs: number[] = [];
				effect(() => {
					logs.push(map.get('a') ?? -1);
				});

				TestBed.flushEffects();
				expect(logs).toEqual([1]);

				map.set('a', 2);
				TestBed.flushEffects();
				expect(logs).toEqual([1, 2]);
			});
		});
	});

	describe('delete', () => {
		it('should delete an existing key', () => {
			const map = new SignalMap<string, number>();
			map.set('a', 1);
			const result = map.delete('a');
			expect(result).toBe(true);
			expect(map.has('a')).toBe(false);
			expect(map.size).toBe(0);
		});

		it('should return false when deleting non-existent key', () => {
			const map = new SignalMap<string, number>();
			const result = map.delete('nonexistent');
			expect(result).toBe(false);
		});

		it('should trigger effects watching the deleted key', () => {
			TestBed.runInInjectionContext(() => {
				const map = new SignalMap<string, number>();
				map.set('a', 1);

				const logs: (number | undefined)[] = [];
				effect(() => {
					logs.push(map.get('a'));
				});

				TestBed.flushEffects();
				expect(logs).toEqual([1]);

				map.delete('a');
				TestBed.flushEffects();
				expect(logs).toEqual([1, undefined]);
			});
		});

		it('should trigger effects watching structure (size)', () => {
			TestBed.runInInjectionContext(() => {
				const map = new SignalMap<string, number>().set('a', 1).set('b', 2);

				const logs: number[] = [];
				effect(() => {
					logs.push(map.size);
				});

				TestBed.flushEffects();
				expect(logs).toEqual([2]);

				map.delete('a');
				TestBed.flushEffects();
				expect(logs).toEqual([2, 1]);
			});
		});
	});

	describe('has', () => {
		it('should return true for existing key', () => {
			const map = new SignalMap<string, number>();
			map.set('a', 1);
			expect(map.has('a')).toBe(true);
		});

		it('should return false for non-existent key', () => {
			const map = new SignalMap<string, number>();
			expect(map.has('nonexistent')).toBe(false);
		});

		it('should track structure changes in computed', () => {
			const map = new SignalMap<string, number>();

			const hasA = computed(() => map.has('a'));
			expect(hasA()).toBe(false);

			map.set('a', 1);
			expect(hasA()).toBe(true);

			map.delete('a');
			expect(hasA()).toBe(false);
		});
	});

	describe('clear', () => {
		it('should remove all entries', () => {
			const map = new SignalMap<string, number>([
				['a', 1],
				['b', 2],
				['c', 3],
			]);
			map.clear();
			expect(map.size).toBe(0);
			expect(map.has('a')).toBe(false);
			expect(map.has('b')).toBe(false);
			expect(map.has('c')).toBe(false);
		});

		it('should do nothing when already empty', () => {
			const map = new SignalMap<string, number>();
			map.clear();
			expect(map.size).toBe(0);
		});

		it('should trigger effects watching individual keys', () => {
			TestBed.runInInjectionContext(() => {
				const map = new SignalMap<string, number>([
					['a', 1],
					['b', 2],
				]);

				const logsA: (number | undefined)[] = [];
				const logsB: (number | undefined)[] = [];

				effect(() => {
					logsA.push(map.get('a'));
				});

				effect(() => {
					logsB.push(map.get('b'));
				});

				TestBed.flushEffects();
				expect(logsA).toEqual([1]);
				expect(logsB).toEqual([2]);

				map.clear();
				TestBed.flushEffects();
				expect(logsA).toEqual([1, undefined]);
				expect(logsB).toEqual([2, undefined]);
			});
		});

		it('should trigger effects watching structure', () => {
			TestBed.runInInjectionContext(() => {
				const map = new SignalMap<string, number>([
					['a', 1],
					['b', 2],
				]);

				const logs: number[] = [];
				effect(() => {
					logs.push(map.size);
				});

				TestBed.flushEffects();
				expect(logs).toEqual([2]);

				map.clear();
				TestBed.flushEffects();
				expect(logs).toEqual([2, 0]);
			});
		});
	});

	describe('size', () => {
		it('should return the correct size', () => {
			const map = new SignalMap<string, number>();
			expect(map.size).toBe(0);

			map.set('a', 1);
			expect(map.size).toBe(1);

			map.set('b', 2);
			expect(map.size).toBe(2);

			map.delete('a');
			expect(map.size).toBe(1);
		});

		it('should be reactive in computed', () => {
			const map = new SignalMap<string, number>();
			const size = computed(() => map.size);

			expect(size()).toBe(0);

			map.set('a', 1);
			expect(size()).toBe(1);

			map.set('b', 2);
			expect(size()).toBe(2);

			map.delete('a');
			expect(size()).toBe(1);

			map.clear();
			expect(size()).toBe(0);
		});
	});

	describe('keys', () => {
		it('should return all keys', () => {
			const map = new SignalMap<string, number>([
				['a', 1],
				['b', 2],
				['c', 3],
			]);
			const keys = Array.from(map.keys());
			expect(keys).toEqual(['a', 'b', 'c']);
		});

		it('should return empty iterator for empty map', () => {
			const map = new SignalMap<string, number>();
			const keys = Array.from(map.keys());
			expect(keys).toEqual([]);
		});

		it('should be reactive in computed', () => {
			const map = new SignalMap<string, number>();
			const keys = computed(() => Array.from(map.keys()));

			expect(keys()).toEqual([]);

			map.set('a', 1);
			expect(keys()).toEqual(['a']);

			map.set('b', 2);
			expect(keys()).toEqual(['a', 'b']);

			map.delete('a');
			expect(keys()).toEqual(['b']);
		});
	});

	describe('values', () => {
		it('should return all values', () => {
			const map = new SignalMap<string, number>([
				['a', 1],
				['b', 2],
				['c', 3],
			]);
			const values = Array.from(map.values());
			expect(values).toEqual([1, 2, 3]);
		});

		it('should return empty iterator for empty map', () => {
			const map = new SignalMap<string, number>();
			const values = Array.from(map.values());
			expect(values).toEqual([]);
		});

		it('should be reactive in computed', () => {
			const map = new SignalMap<string, number>();
			const values = computed(() => Array.from(map.values()));

			expect(values()).toEqual([]);

			map.set('a', 1);
			expect(values()).toEqual([1]);

			map.set('b', 2);
			expect(values()).toEqual([1, 2]);

			map.set('a', 10);
			expect(values()).toEqual([10, 2]);
		});

		it('should not include removed values', () => {
			const map = new SignalMap<string, number>([
				['a', 1],
				['b', 2],
			]);
			map.delete('a');
			const values = Array.from(map.values());
			expect(values).toEqual([2]);
		});
	});

	describe('entries', () => {
		it('should return all entries', () => {
			const map = new SignalMap<string, number>([
				['a', 1],
				['b', 2],
				['c', 3],
			]);
			const entries = Array.from(map.entries());
			expect(entries).toEqual([
				['a', 1],
				['b', 2],
				['c', 3],
			]);
		});

		it('should return empty iterator for empty map', () => {
			const map = new SignalMap<string, number>();
			const entries = Array.from(map.entries());
			expect(entries).toEqual([]);
		});

		it('should be reactive in computed', () => {
			const map = new SignalMap<string, number>();
			const entries = computed(() => Array.from(map.entries()));

			expect(entries()).toEqual([]);

			map.set('a', 1);
			expect(entries()).toEqual([['a', 1]]);

			map.set('b', 2);
			expect(entries()).toEqual([
				['a', 1],
				['b', 2],
			]);

			map.delete('a');
			expect(entries()).toEqual([['b', 2]]);
		});
	});

	describe('forEach', () => {
		it('should iterate over all entries', () => {
			const map = new SignalMap<string, number>([
				['a', 1],
				['b', 2],
				['c', 3],
			]);
			const entries: [number, string][] = [];
			map.forEach((value, key) => {
				entries.push([value, key]);
			});
			expect(entries).toEqual([
				[1, 'a'],
				[2, 'b'],
				[3, 'c'],
			]);
		});

		it('should be iterable with for...of', () => {
			const map = new SignalMap<string, number>([
				['a', 1],
				['b', 2],
				['c', 3],
			]);
			const entries: [string, number][] = [];
			for (const [key, value] of map) {
				entries.push([key, value]);
			}
			expect(entries).toEqual([
				['a', 1],
				['b', 2],
				['c', 3],
			]);
		});

		it('should work with spread operator', () => {
			const map = new SignalMap<string, number>([
				['a', 1],
				['b', 2],
			]);
			const entries = [...map];
			expect(entries).toEqual([
				['a', 1],
				['b', 2],
			]);
		});

		it('should pass the map as third argument', () => {
			TestBed.runInInjectionContext(() => {
				const map = new SignalMap<string, number>([['a', 1]]);
				map.forEach((value, key, m) => {
					expect(m).toBe(map);
				});
			});
		});

		it('should do nothing for empty map', () => {
			TestBed.runInInjectionContext(() => {
				const map = new SignalMap<string, number>();
				let count = 0;
				map.forEach(() => {
					count++;
				});
				expect(count).toBe(0);
			});
		});

		it('should be reactive in computed', () => {
			const map = new SignalMap<string, number>();
			const sum = computed(() => {
				let total = 0;
				map.forEach((value) => {
					total += value;
				});
				return total;
			});

			expect(sum()).toBe(0);

			map.set('a', 1);
			expect(sum()).toBe(1);

			map.set('b', 2);
			expect(sum()).toBe(3);

			map.set('c', 3);
			expect(sum()).toBe(6);

			map.delete('b');
			expect(sum()).toBe(4);
		});
	});

	describe('complex scenarios', () => {
		it('should handle multiple effects watching different keys', () => {
			TestBed.runInInjectionContext(() => {
				const map = new SignalMap<string, number>();

				const logsA: (number | undefined)[] = [];
				const logsB: (number | undefined)[] = [];

				effect(() => {
					logsA.push(map.get('a'));
				});

				effect(() => {
					logsB.push(map.get('b'));
				});

				TestBed.flushEffects();
				expect(logsA[logsA.length - 1]).toEqual(undefined);
				expect(logsB[logsB.length - 1]).toEqual(undefined);

				map.set('a', 1);
				TestBed.flushEffects();
				expect(logsA[logsA.length - 1]).toEqual(1);
				const logsBLengthBeforeB = logsB.length;

				map.set('b', 2);
				TestBed.flushEffects();
				expect(logsA[logsA.length - 1]).toEqual(1); // 'a' not affected after setting 'b'
				expect(logsB[logsB.length - 1]).toEqual(2);
				expect(logsB.length).toBeGreaterThan(logsBLengthBeforeB); // 'b' was updated

				map.set('a', 10);
				TestBed.flushEffects();
				expect(logsA[logsA.length - 1]).toEqual(10);
				const logsBLengthBeforeA = logsB.length;
				expect(logsB.length).toBe(logsBLengthBeforeA); // 'b' not affected after setting 'a'
			});
		});

		it('should handle derived computations correctly', () => {
			TestBed.runInInjectionContext(() => {
				const map = new SignalMap<string, number>();
				map.set('a', 1);
				map.set('b', 2);

				const sum = computed(() => {
					const a = map.get('a') ?? 0;
					const b = map.get('b') ?? 0;
					return a + b;
				});

				expect(sum()).toBe(3);

				map.set('a', 5);
				expect(sum()).toBe(7);

				map.delete('b');
				expect(sum()).toBe(5);

				map.set('b', 3);
				expect(sum()).toBe(8);
			});
		});

		it('should handle rapid mutations correctly', () => {
			TestBed.runInInjectionContext(() => {
				const map = new SignalMap<string, number>();

				const logs: number[] = [];
				effect(() => {
					logs.push(map.get('a') ?? -1);
				});

				TestBed.flushEffects();
				expect(logs).toEqual([-1]);

				// Rapid mutations
				map.set('a', 1);
				map.set('a', 2);
				map.set('a', 3);
				TestBed.flushEffects();

				// Should only capture final state
				expect(logs.length).toBeGreaterThan(1);
				expect(logs[logs.length - 1]).toBe(3);
			});
		});

		it('should work with complex value types', () => {
			TestBed.runInInjectionContext(() => {
				interface User {
					id: number;
					name: string;
				}

				const map = new SignalMap<number, User>();
				map.set(1, { id: 1, name: 'Alice' });
				map.set(2, { id: 2, name: 'Bob' });

				const user1 = computed(() => map.get(1));
				expect(user1()).toEqual({ id: 1, name: 'Alice' });

				map.set(1, { id: 1, name: 'Alice Updated' });
				expect(user1()).toEqual({ id: 1, name: 'Alice Updated' });
			});
		});

		it('should handle object and symbol keys', () => {
			TestBed.runInInjectionContext(() => {
				const objKey = { id: 1 };
				const symKey = Symbol('test');

				const map = new SignalMap<object | symbol, string>();
				map.set(objKey, 'object value');
				map.set(symKey, 'symbol value');

				expect(map.get(objKey)).toBe('object value');
				expect(map.get(symKey)).toBe('symbol value');
				expect(map.size).toBe(2);
			});
		});

		it('should maintain correct state after clear and repopulate', () => {
			TestBed.runInInjectionContext(() => {
				const map = new SignalMap<string, number>([
					['a', 1],
					['b', 2],
				]);

				const size = computed(() => map.size);
				expect(size()).toBe(2);

				map.clear();
				expect(size()).toBe(0);

				map.set('x', 10);
				map.set('y', 20);
				expect(size()).toBe(2);
				expect(map.get('a')).toBe(undefined);
				expect(map.get('x')).toBe(10);
			});
		});

		it('should not trigger structure effects when only values change', () => {
			TestBed.runInInjectionContext(() => {
				const map = new SignalMap<string, number>([['a', 1]]);

				let structureChangeCount = 0;
				effect(() => {
					structureChangeCount++;
					map.size; // Track structure
				});

				TestBed.flushEffects();
				const initialCount = structureChangeCount;

				// Update value (not structure)
				map.set('a', 2);
				TestBed.flushEffects();

				// Structure should not have changed
				expect(structureChangeCount).toBe(initialCount);

				// Add new key (structure change)
				map.set('b', 3);
				TestBed.flushEffects();

				// Structure should have changed
				expect(structureChangeCount).toBeGreaterThan(initialCount);
			});
		});

		it('should work with empty string and zero as values', () => {
			TestBed.runInInjectionContext(() => {
				const map = new SignalMap<string, string | number>();
				map.set('empty', '');
				map.set('zero', 0);

				expect(map.get('empty')).toBe('');
				expect(map.get('zero')).toBe(0);
				expect(map.has('empty')).toBe(true);
				expect(map.has('zero')).toBe(true);
			});
		});
	});

	describe('edge cases', () => {
		it('should handle deleting and re-adding the same key', () => {
			TestBed.runInInjectionContext(() => {
				const map = new SignalMap<string, number>();
				map.set('a', 1);

				const logs: (number | undefined)[] = [];
				effect(() => {
					logs.push(map.get('a'));
				});

				TestBed.flushEffects();
				expect(logs).toEqual([1]);

				map.delete('a');
				TestBed.flushEffects();
				expect(logs).toEqual([1, undefined]);

				map.set('a', 2);
				TestBed.flushEffects();
				expect(logs).toEqual([1, undefined, 2]);
			});
		});

		it('should handle effects that modify the map', () => {
			TestBed.runInInjectionContext(() => {
				const map = new SignalMap<string, number>();
				const trigger = signal(0);

				effect(() => {
					trigger(); // Track trigger
					if (!map.has('derived')) {
						map.set('derived', 1);
					}
				});

				TestBed.flushEffects();
				expect(map.has('derived')).toBe(true);
			});
		});

		it('should work with NaN as value', () => {
			TestBed.runInInjectionContext(() => {
				const map = new SignalMap<string, number>();
				map.set('nan', NaN);

				const value = map.get('nan');
				expect(Number.isNaN(value)).toBe(true);
			});
		});

		it('should handle large maps efficiently', () => {
			TestBed.runInInjectionContext(() => {
				const map = new SignalMap<number, number>();

				// Add 1000 entries
				for (let i = 0; i < 1000; i++) {
					map.set(i, i * 2);
				}

				expect(map.size).toBe(1000);
				expect(map.get(500)).toBe(1000);

				// Delete half
				for (let i = 0; i < 500; i++) {
					map.delete(i);
				}

				expect(map.size).toBe(500);
			});
		});
	});
});
