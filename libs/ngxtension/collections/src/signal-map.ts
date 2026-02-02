import { signal, WritableSignal } from '@angular/core';

// Internal symbol to track deletion notifications safely
// We use this instead of 'undefined' so we can support maps that actually store 'undefined' as a value.
const REMOVED = Symbol('REMOVED');

export class SignalMap<K, V> {
	// Storage now holds V | REMOVED
	private _storage = new Map<K, WritableSignal<V | typeof REMOVED>>();

	private _structure = signal(0);

	constructor(entries?: readonly (readonly [K, V])[] | null) {
		if (entries) {
			for (const [key, value] of entries) {
				this._storage.set(key, signal(value));
			}
		}

		return this;
	}

	get(key: K): V | undefined {
		const valueSignal = this._storage.get(key);

		if (valueSignal) {
			// 1. Key exists: We listen ONLY to this signal.
			// If this key is deleted later, 'delete()' will fire this signal with REMOVED.
			const value = valueSignal();

			// Safety check: if we are in a computed chain where the map was just mutated
			// but the signal is still lingering.
			if (value === REMOVED) {
				return undefined;
			}
			return value as V;
		} else {
			// 2. Key missing: We must listen to _structure.
			// If we don't do this, we won't know when the key is added.
			this._structure();
			return undefined;
		}
	}

	set(key: K, value: V): this {
		const existingSignal = this._storage.get(key);

		if (existingSignal) {
			// Key exists: Update value only.
			// Observers of this key update. Observers of 'structure' (keys/size) do NOT.
			existingSignal.set(value);
		} else {
			// New key: Add to storage and update structure.
			this._storage.set(key, signal(value));
			this._structure.update((v) => v + 1);
		}
		return this;
	}

	delete(key: K): boolean {
		const existingSignal = this._storage.get(key);

		if (existingSignal) {
			// STEP 1: Notify the specific signal listeners that this value is "changed" (to removed).
			// This forces effects relying on get(key) to re-run.
			existingSignal.set(REMOVED);

			// STEP 2: Remove from storage
			this._storage.delete(key);

			// STEP 3: Notify structure listeners (keys/size/iterators)
			this._structure.update((v) => v + 1);
			return true;
		}
		return false;
	}

	has(key: K): boolean {
		this._structure();
		return this._storage.has(key);
	}

	clear(): void {
		if (this._storage.size > 0) {
			// Notify ALL value signals that they are removed
			for (const s of this._storage.values()) {
				s.set(REMOVED);
			}
			this._storage.clear();
			this._structure.update((v) => v + 1);
		}
	}

	get size(): number {
		this._structure();
		return this._storage.size;
	}

	*keys(): IterableIterator<K> {
		this._structure();
		yield* this._storage.keys();
	}

	*values(): IterableIterator<V> {
		this._structure();
		for (const s of this._storage.values()) {
			const val = s();
			if (val !== REMOVED) yield val as V;
		}
	}

	*entries(): IterableIterator<[K, V]> {
		this._structure();
		for (const [key, s] of this._storage.entries()) {
			const val = s();
			if (val !== REMOVED) yield [key, val as V];
		}
	}

	forEach(callback: (value: V, key: K, map: SignalMap<K, V>) => void): void {
		this._structure();
		this._storage.forEach((s, key) => {
			const val = s();
			if (val !== REMOVED) callback(val as V, key, this);
		});
	}

	[Symbol.iterator](): IterableIterator<[K, V]> {
		return this.entries();
	}
}
