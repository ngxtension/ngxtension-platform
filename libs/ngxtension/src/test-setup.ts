// @ts-expect-error https://thymikee.github.io/jest-preset-angular/docs/getting-started/test-environment
globalThis.ngJest = {
	testEnvironmentOptions: {
		errorOnUnknownElements: true,
		errorOnUnknownProperties: true,
	},
};

import {
	REACTIVE_NODE,
	ReactiveNode,
	setActiveConsumer,
} from '@angular/core/primitives/signals';
import { TestBed } from '@angular/core/testing';
import 'jest-preset-angular/setup-jest';

declare global {
	namespace jest {
		interface It {
			insideInjectionContext: (
				name: string,
				fn: (() => void) | (() => PromiseLike<unknown>),
				timeout?: number,
			) => void;
		}

		interface Matchers<R> {
			toBeReactivePure: () => R;
		}
	}
}

it.insideInjectionContext = (
	name: string,
	fn: (() => void) | (() => PromiseLike<unknown>),
	timeout?: number,
) => {
	it(name, () => TestBed.runInInjectionContext(fn), timeout);
};

expect.extend({
	toBeReactivePure: function (
		this: jest.MatcherContext,
		fn: () => void,
	): jest.CustomMatcherResult {
		const reactiveNode: ReactiveNode = Object.create(REACTIVE_NODE);
		const prevConsumer = setActiveConsumer(reactiveNode);

		reactiveNode.consumerAllowSignalWrites = true;

		try {
			fn();
		} finally {
			setActiveConsumer(prevConsumer);
		}

		if (reactiveNode.producerNode?.length) {
			return {
				message: () =>
					`Expected to be reactive pure: Found ${reactiveNode.producerNode?.length} producers`,
				pass: false,
			};
		}

		return {
			message: () => `Expected to be not reactive pure`,
			pass: true,
		};
	},
});
