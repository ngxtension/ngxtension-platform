import { computed, effect, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SignalSet } from './signal-set';

describe('SignalSet', () => {
	describe('constructor', () => {
		it('should create an empty set when no values provided', () => {
			const set = new SignalSet<string>();
			expect(set.size).toBe(0);
		});

		it('should create a set with initial values', () => {
			const set = new SignalSet<string>(['a', 'b', 'c']);
			expect(set.size).toBe(3);
			expect(set.has('a')).toBe(true);
			expect(set.has('b')).toBe(true);
			expect(set.has('c')).toBe(true);
		});

		it('should handle null values', () => {
			const set = new SignalSet<string>(null);
			expect(set.size).toBe(0);
		});

		it('should handle duplicate values in initialization', () => {
			const set = new SignalSet<string>(['a', 'b', 'a', 'c', 'b']);
			expect(set.size).toBe(3);
			expect(Array.from(set.values())).toEqual(['a', 'b', 'c']);
		});

		it('should support undefined as a value', () => {
			const set = new SignalSet<undefined>([undefined, undefined]);
			expect(set.size).toBe(1);
			expect(set.has(undefined)).toBe(true);
		});

		it('should support null as a value', () => {
			const set = new SignalSet<null | string>([null, 'a', null]);
			expect(set.size).toBe(2);
			expect(set.has(null)).toBe(true);
			expect(set.has('a')).toBe(true);
		});
	});

	describe('has', () => {
		it('should return true for existing value', () => {
			const set = new SignalSet<string>();
			set.add('a');
			expect(set.has('a')).toBe(true);
		});

		it('should return false for non-existent value', () => {
			const set = new SignalSet<string>();
			expect(set.has('nonexistent')).toBe(false);
		});

		it('should track structure changes in computed', () => {
			const set = new SignalSet<string>();

			const hasA = computed(() => set.has('a'));
			expect(hasA()).toBe(false);

			set.add('a');
			expect(hasA()).toBe(true);

			set.delete('a');
			expect(hasA()).toBe(false);
		});

		it('should distinguish between different values', () => {
			const set = new SignalSet<number>().add(0).add(1);

			expect(set.has(0)).toBe(true);
			expect(set.has(1)).toBe(true);
			expect(set.has(2)).toBe(false);
		});
	});

	describe('add', () => {
		it('should add a new value', () => {
			const set = new SignalSet<string>();
			set.add('a');
			expect(set.has('a')).toBe(true);
			expect(set.size).toBe(1);
		});

		it('should not add duplicate values', () => {
			const set = new SignalSet<string>();
			set.add('a');
			set.add('a');
			expect(set.size).toBe(1);
		});

		it('should return this for chaining', () => {
			const set = new SignalSet<string>();
			const result = set.add('a').add('b').add('c');
			expect(result).toBe(set);
			expect(set.size).toBe(3);
		});

		it('should trigger effects when adding new values', () => {
			TestBed.runInInjectionContext(() => {
				const set = new SignalSet<string>();
				const logs: number[] = [];

				effect(() => {
					logs.push(set.size);
				});

				TestBed.flushEffects();
				expect(logs).toEqual([0]);

				set.add('a');
				TestBed.flushEffects();
				expect(logs).toEqual([0, 1]);

				set.add('b');
				TestBed.flushEffects();
				expect(logs).toEqual([0, 1, 2]);
			});
		});

		it('should not trigger structure effects when adding duplicate', () => {
			const set = new SignalSet<string>();
			set.add('a');

			let structureChanges = 0;
			const sizeComputed = computed(() => {
				structureChanges++;
				return set.size;
			});

			// Initial read
			expect(sizeComputed()).toBe(1);
			structureChanges = 0;

			// Add duplicate should not trigger structure change
			set.add('a');
			expect(structureChanges).toBe(0);
		});

		it('should work with object values', () => {
			const obj1 = { id: 1 };
			const obj2 = { id: 2 };
			const set = new SignalSet<object>();

			set.add(obj1);
			set.add(obj2);

			expect(set.has(obj1)).toBe(true);
			expect(set.has(obj2)).toBe(true);
			expect(set.has({ id: 1 })).toBe(false); // Different object
		});
	});

	describe('delete', () => {
		it('should delete an existing value', () => {
			const set = new SignalSet<string>();
			set.add('a');
			const result = set.delete('a');
			expect(result).toBe(true);
			expect(set.has('a')).toBe(false);
			expect(set.size).toBe(0);
		});

		it('should return false when deleting non-existent value', () => {
			const set = new SignalSet<string>();
			const result = set.delete('nonexistent');
			expect(result).toBe(false);
		});

		it('should trigger effects watching structure (size)', () => {
			TestBed.runInInjectionContext(() => {
				const set = new SignalSet<string>();
				set.add('a');
				set.add('b');

				const logs: number[] = [];
				effect(() => {
					logs.push(set.size);
				});

				TestBed.flushEffects();
				expect(logs).toEqual([2]);

				set.delete('a');
				TestBed.flushEffects();
				expect(logs).toEqual([2, 1]);
			});
		});

		it('should allow re-adding deleted values', () => {
			const set = new SignalSet<string>();
			set.add('a');
			set.delete('a');
			set.add('a');

			expect(set.has('a')).toBe(true);
			expect(set.size).toBe(1);
		});
	});

	describe('clear', () => {
		it('should remove all values', () => {
			const set = new SignalSet<string>(['a', 'b', 'c']);
			set.clear();
			expect(set.size).toBe(0);
			expect(set.has('a')).toBe(false);
			expect(set.has('b')).toBe(false);
			expect(set.has('c')).toBe(false);
		});

		it('should do nothing when already empty', () => {
			const set = new SignalSet<string>();
			set.clear();
			expect(set.size).toBe(0);
		});

		it('should trigger effects watching structure', () => {
			TestBed.runInInjectionContext(() => {
				const set = new SignalSet<string>(['a', 'b']);

				const logs: number[] = [];
				effect(() => {
					logs.push(set.size);
				});

				TestBed.flushEffects();
				expect(logs).toEqual([2]);

				set.clear();
				TestBed.flushEffects();
				expect(logs).toEqual([2, 0]);
			});
		});

		it('should allow adding values after clear', () => {
			const set = new SignalSet<string>(['a', 'b']);
			set.clear();
			set.add('x');
			set.add('y');

			expect(set.size).toBe(2);
			expect(set.has('x')).toBe(true);
			expect(set.has('y')).toBe(true);
			expect(set.has('a')).toBe(false);
		});
	});

	describe('size', () => {
		it('should return the correct size', () => {
			const set = new SignalSet<string>();
			expect(set.size).toBe(0);

			set.add('a');
			expect(set.size).toBe(1);

			set.add('b');
			expect(set.size).toBe(2);

			set.delete('a');
			expect(set.size).toBe(1);
		});

		it('should be reactive in computed', () => {
			const set = new SignalSet<string>();
			const size = computed(() => set.size);

			expect(size()).toBe(0);

			set.add('a');
			expect(size()).toBe(1);

			set.add('b');
			expect(size()).toBe(2);

			set.delete('a');
			expect(size()).toBe(1);

			set.clear();
			expect(size()).toBe(0);
		});

		it('should not increase when adding duplicates', () => {
			const set = new SignalSet<string>();
			set.add('a');
			expect(set.size).toBe(1);

			set.add('a');
			expect(set.size).toBe(1);
		});
	});

	describe('keys', () => {
		it('should return all keys (same as values for Set)', () => {
			const set = new SignalSet<string>(['a', 'b', 'c']);
			const keys = Array.from(set.keys());
			expect(keys).toEqual(['a', 'b', 'c']);
		});

		it('should return empty iterator for empty set', () => {
			const set = new SignalSet<string>();
			const keys = Array.from(set.keys());
			expect(keys).toEqual([]);
		});

		it('should be reactive in computed', () => {
			const set = new SignalSet<string>();
			const keys = computed(() => Array.from(set.keys()));

			expect(keys()).toEqual([]);

			set.add('a');
			expect(keys()).toEqual(['a']);

			set.add('b');
			expect(keys()).toEqual(['a', 'b']);

			set.delete('a');
			expect(keys()).toEqual(['b']);
		});
	});

	describe('values', () => {
		it('should return all values', () => {
			const set = new SignalSet<string>(['a', 'b', 'c']);
			const values = Array.from(set.values());
			expect(values).toEqual(['a', 'b', 'c']);
		});

		it('should return empty iterator for empty set', () => {
			const set = new SignalSet<string>();
			const values = Array.from(set.values());
			expect(values).toEqual([]);
		});

		it('should be reactive in computed', () => {
			const set = new SignalSet<string>();
			const values = computed(() => Array.from(set.values()));

			expect(values()).toEqual([]);

			set.add('a');
			expect(values()).toEqual(['a']);

			set.add('b');
			expect(values()).toEqual(['a', 'b']);

			set.delete('a');
			expect(values()).toEqual(['b']);
		});

		it('should not include removed values', () => {
			const set = new SignalSet<string>(['a', 'b']);
			set.delete('a');
			const values = Array.from(set.values());
			expect(values).toEqual(['b']);
		});
	});

	describe('entries', () => {
		it('should return all entries as [value, value] tuples', () => {
			const set = new SignalSet<string>(['a', 'b', 'c']);
			const entries = Array.from(set.entries());
			expect(entries).toEqual([
				['a', 'a'],
				['b', 'b'],
				['c', 'c'],
			]);
		});

		it('should return empty iterator for empty set', () => {
			const set = new SignalSet<string>();
			const entries = Array.from(set.entries());
			expect(entries).toEqual([]);
		});

		it('should be reactive in computed', () => {
			const set = new SignalSet<string>();
			const entries = computed(() => Array.from(set.entries()));

			expect(entries()).toEqual([]);

			set.add('a');
			expect(entries()).toEqual([['a', 'a']]);

			set.add('b');
			expect(entries()).toEqual([
				['a', 'a'],
				['b', 'b'],
			]);

			set.delete('a');
			expect(entries()).toEqual([['b', 'b']]);
		});
	});

	describe('forEach', () => {
		it('should iterate over all values', () => {
			const set = new SignalSet<string>(['a', 'b', 'c']);
			const values: string[] = [];
			set.forEach((value) => {
				values.push(value);
			});
			expect(values).toEqual(['a', 'b', 'c']);
		});

		it('should pass value twice and set as arguments', () => {
			const set = new SignalSet<string>(['a']);
			set.forEach((value1, value2, s) => {
				expect(value1).toBe('a');
				expect(value2).toBe('a');
				expect(s).toBe(set);
			});
		});

		it('should do nothing for empty set', () => {
			const set = new SignalSet<string>();
			let count = 0;
			set.forEach(() => {
				count++;
			});
			expect(count).toBe(0);
		});

		it('should be reactive in computed', () => {
			const set = new SignalSet<number>();
			const sum = computed(() => {
				let total = 0;
				set.forEach((value) => {
					total += value;
				});
				return total;
			});

			expect(sum()).toBe(0);

			set.add(1);
			expect(sum()).toBe(1);

			set.add(2);
			expect(sum()).toBe(3);

			set.add(3);
			expect(sum()).toBe(6);

			set.delete(2);
			expect(sum()).toBe(4);
		});

		it('should be iterable with for...of', () => {
			const set = new SignalSet<string>(['a', 'b', 'c']);
			const values: string[] = [];
			for (const value of set) {
				values.push(value);
			}
			expect(values).toEqual(['a', 'b', 'c']);
		});

		it('should work with spread operator', () => {
			const set = new SignalSet<string>(['a', 'b']);
			const values = [...set];
			expect(values).toEqual(['a', 'b']);
		});
	});

	describe('complex scenarios', () => {
		it('should handle multiple effects watching structure', () => {
			TestBed.runInInjectionContext(() => {
				const set = new SignalSet<string>();

				const logsSize: number[] = [];
				const logsHas: boolean[] = [];

				effect(() => {
					logsSize.push(set.size);
				});

				effect(() => {
					logsHas.push(set.has('a'));
				});

				TestBed.flushEffects();
				expect(logsSize[logsSize.length - 1]).toBe(0);
				expect(logsHas[logsHas.length - 1]).toBe(false);

				set.add('a');
				TestBed.flushEffects();
				expect(logsSize[logsSize.length - 1]).toBe(1);
				expect(logsHas[logsHas.length - 1]).toBe(true);

				set.add('b');
				TestBed.flushEffects();
				expect(logsSize[logsSize.length - 1]).toBe(2);

				set.delete('a');
				TestBed.flushEffects();
				expect(logsSize[logsSize.length - 1]).toBe(1);
				expect(logsHas[logsHas.length - 1]).toBe(false);
			});
		});

		it('should handle derived computations correctly', () => {
			const set = new SignalSet<number>();
			set.add(1);
			set.add(2);
			set.add(3);

			const sum = computed(() => {
				let total = 0;
				for (const value of set) {
					total += value;
				}
				return total;
			});

			expect(sum()).toBe(6);

			set.add(4);
			expect(sum()).toBe(10);

			set.delete(2);
			expect(sum()).toBe(8);
		});

		it('should work with complex value types', () => {
			interface User {
				id: number;
				name: string;
			}

			const user1: User = { id: 1, name: 'Alice' };
			const user2: User = { id: 2, name: 'Bob' };

			const set = new SignalSet<User>();
			set.add(user1);
			set.add(user2);

			const hasUser1 = computed(() => set.has(user1));
			expect(hasUser1()).toBe(true);

			set.delete(user1);
			expect(hasUser1()).toBe(false);
		});

		it('should handle symbol values', () => {
			const sym1 = Symbol('test1');
			const sym2 = Symbol('test2');

			const set = new SignalSet<symbol>();
			set.add(sym1);
			set.add(sym2);

			expect(set.has(sym1)).toBe(true);
			expect(set.has(sym2)).toBe(true);
			expect(set.size).toBe(2);
		});

		it('should maintain correct state after clear and repopulate', () => {
			const set = new SignalSet<string>(['a', 'b']);

			const size = computed(() => set.size);
			expect(size()).toBe(2);

			set.clear();
			expect(size()).toBe(0);

			set.add('x');
			set.add('y');
			expect(size()).toBe(2);
			expect(set.has('a')).toBe(false);
			expect(set.has('x')).toBe(true);
		});

		it('should work with empty string and zero as values', () => {
			const set = new SignalSet<string | number>();
			set.add('');
			set.add(0);

			expect(set.has('')).toBe(true);
			expect(set.has(0)).toBe(true);
			expect(set.size).toBe(2);
		});

		it('should work with boolean values', () => {
			const set = new SignalSet<boolean>();
			set.add(true);
			set.add(false);

			expect(set.has(true)).toBe(true);
			expect(set.has(false)).toBe(true);
			expect(set.size).toBe(2);

			set.add(true); // Duplicate
			expect(set.size).toBe(2);
		});
	});

	describe('edge cases', () => {
		it('should handle deleting and re-adding the same value', () => {
			TestBed.runInInjectionContext(() => {
				const set = new SignalSet<string>();
				set.add('a');

				const logs: boolean[] = [];
				effect(() => {
					logs.push(set.has('a'));
				});

				TestBed.flushEffects();
				expect(logs[logs.length - 1]).toBe(true);

				set.delete('a');
				TestBed.flushEffects();
				expect(logs[logs.length - 1]).toBe(false);

				set.add('a');
				TestBed.flushEffects();
				expect(logs[logs.length - 1]).toBe(true);
			});
		});

		it('should handle effects that modify the set', () => {
			TestBed.runInInjectionContext(() => {
				const set = new SignalSet<string>();
				const trigger = signal(0);

				effect(() => {
					trigger(); // Track trigger
					if (!set.has('derived')) {
						set.add('derived');
					}
				});

				TestBed.flushEffects();
				expect(set.has('derived')).toBe(true);
			});
		});

		it('should work with NaN as value', () => {
			const set = new SignalSet<number>();
			set.add(NaN);
			set.add(NaN); // NaN !== NaN in JS, but Set treats them as same

			// Standard Set behavior: NaN is treated as equal to NaN
			expect(set.size).toBe(1);
			expect(set.has(NaN)).toBe(true);
		});

		it('should handle large sets efficiently', () => {
			const set = new SignalSet<number>();

			// Add 1000 values
			for (let i = 0; i < 1000; i++) {
				set.add(i);
			}

			expect(set.size).toBe(1000);
			expect(set.has(500)).toBe(true);

			// Delete half
			for (let i = 0; i < 500; i++) {
				set.delete(i);
			}

			expect(set.size).toBe(500);
		});

		it('should handle set operations pattern', () => {
			const set1 = new SignalSet<number>([1, 2, 3]);
			const set2 = new SignalSet<number>([2, 3, 4]);

			// Union
			const union = computed(() => {
				const result = new Set<number>();
				for (const v of set1) result.add(v);
				for (const v of set2) result.add(v);
				return Array.from(result).sort();
			});
			expect(union()).toEqual([1, 2, 3, 4]);

			// Intersection
			const intersection = computed(() => {
				const result: number[] = [];
				for (const v of set1) {
					if (set2.has(v)) result.push(v);
				}
				return result.sort();
			});
			expect(intersection()).toEqual([2, 3]);

			// Difference
			const difference = computed(() => {
				const result: number[] = [];
				for (const v of set1) {
					if (!set2.has(v)) result.push(v);
				}
				return result.sort();
			});
			expect(difference()).toEqual([1]);
		});

		it('should maintain insertion order', () => {
			const set = new SignalSet<string>();
			set.add('c');
			set.add('a');
			set.add('b');

			expect(Array.from(set)).toEqual(['c', 'a', 'b']);
		});

		it('should handle conversion to regular Set', () => {
			const signalSet = new SignalSet<string>(['a', 'b', 'c']);
			const regularSet = new Set(signalSet);

			expect(regularSet.size).toBe(3);
			expect(regularSet.has('a')).toBe(true);
			expect(regularSet.has('b')).toBe(true);
			expect(regularSet.has('c')).toBe(true);
		});

		it('should have correct Symbol.toStringTag', () => {
			const set = new SignalSet<string>();
			expect(Object.prototype.toString.call(set)).toBe('[object SignalSet]');
			expect(set[Symbol.toStringTag]).toBe('SignalSet');
		});

		it('should support thisArg in forEach', () => {
			const set = new SignalSet<string>(['a', 'b']);
			const context = { multiplier: 2 };
			const results: number[] = [];

			set.forEach(function (this: { multiplier: number }, value) {
				results.push(value.length * this.multiplier);
			}, context);

			expect(results).toEqual([2, 2]); // 'a'.length * 2, 'b'.length * 2
		});
	});
});
