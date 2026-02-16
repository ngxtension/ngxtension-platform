import { CreateSignalOptions, WritableSignal } from '@angular/core';
import {
	SIGNAL,
	SignalGetter,
	signalSetFn,
	signalUpdateFn,
} from '@angular/core/primitives/signals';
import { createSignal } from 'ngxtension/create-signal';

export function debounceSignal<T>(
	initialValue: T,
	time: number,
	options?: CreateSignalOptions<T>,
): WritableSignal<T> {
	const signalFn = createSignal(initialValue) as SignalGetter<T> &
		WritableSignal<T>;
	const node = signalFn[SIGNAL];
	if (options?.equal) {
		node.equal = options.equal;
	}

	let timeoutId: ReturnType<typeof setTimeout> | undefined;

	signalFn.set = (newValue: T) => {
		clearTimeout(timeoutId);

		timeoutId = setTimeout(() => signalSetFn(node, newValue), time);
	};

	signalFn.update = (updateFn: (value: T) => T) => {
		clearTimeout(timeoutId);

		timeoutId = setTimeout(() => signalUpdateFn(node, updateFn), time);
	};

	return signalFn;
}
