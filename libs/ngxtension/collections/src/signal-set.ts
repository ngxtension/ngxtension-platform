import { SignalMap } from './signal-map';

// A unique symbol to use as the map value (since Sets only care about keys)
const PRESENT = Symbol('PRESENT');

export class SignalSet<T> implements Set<T> {
	private _map = new SignalMap<T, typeof PRESENT>();

	constructor(values?: readonly T[] | null) {
		if (values) {
			for (const value of values) {
				this._map.set(value, PRESENT);
			}
		}
		return this;
	}

	has(value: T): boolean {
		return this._map.has(value);
	}

	add(value: T): this {
		this._map.set(value, PRESENT);
		return this;
	}

	delete(value: T): boolean {
		return this._map.delete(value);
	}

	clear(): void {
		this._map.clear();
	}

	get size(): number {
		return this._map.size;
	}

	keys(): IterableIterator<T> {
		return this._map.keys();
	}

	values(): IterableIterator<T> {
		return this._map.keys();
	}

	*entries(): IterableIterator<[T, T]> {
		for (const value of this._map.keys()) {
			yield [value, value];
		}
	}

	forEach(
		callbackfn: (value: T, value2: T, set: Set<T>) => void,
		thisArg?: any,
	): void {
		this._map.forEach((_, value) => {
			callbackfn.call(thisArg, value, value, this);
		});
	}

	[Symbol.iterator](): IterableIterator<T> {
		return this.values();
	}

	get [Symbol.toStringTag](): string {
		return 'SignalSet';
	}
}
