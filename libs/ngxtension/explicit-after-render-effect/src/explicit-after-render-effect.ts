import {
	afterRenderEffect,
	AfterRenderOptions,
	AfterRenderRef,
	EffectCleanupRegisterFn,
	Signal,
	untracked,
} from '@angular/core';

/** Getters used to declare explicit dependencies. */
type ExplicitAfterRenderEffectValues<T extends readonly unknown[]> = {
	readonly [K in keyof T]: () => T[K];
};

/** Wrapper for 'earlyRead': resolves deps and runs callback in untracked. */
function wrapEarlyReadPhase<Input extends readonly unknown[], R>(
	deps: ReadonlyArray<() => unknown>,
	fn: (values: Input, onCleanup: EffectCleanupRegisterFn) => R,
): (onCleanup: EffectCleanupRegisterFn) => R {
	return (onCleanup) => {
		const values = deps.map((d) => d()) as unknown as Input;
		return untracked(() => fn(values, onCleanup));
	};
}

/** Wrapper for other phases: handles dynamic args (prev/cleanup) and untracked. */
function wrapPhase<Input extends readonly unknown[], P, R>(
	deps: ReadonlyArray<() => unknown>,
	fn: (
		values: Input,
		prev: Signal<P> | undefined,
		onCleanup: EffectCleanupRegisterFn,
	) => R,
): (
	...args: [EffectCleanupRegisterFn] | [Signal<P>, EffectCleanupRegisterFn]
) => R {
	return (...args): R => {
		const values = deps.map((d) => d()) as unknown as Input;
		const [prevOrCleanup, maybeCleanup] = args;
		const onCleanup = (maybeCleanup ??
			prevOrCleanup) as EffectCleanupRegisterFn;
		const prev = maybeCleanup ? (prevOrCleanup as Signal<P>) : undefined;

		return untracked(() => fn(values, prev, onCleanup));
	};
}

/**
 * Explicit version of afterRenderEffect: triggers only when 'deps' change.
 * Internal signal reads are ignored.
 * @example
 * Single-phase (convenience) form, runs in the `read` phase:
 * ```typescript
 * import { explicitAfterRenderEffect } from 'ngxtension/explicit-after-render-effect';
 *
 * const width = signal(0);
 *
 * explicitAfterRenderEffect([width], ([width], cleanup) => {
 *   console.log('measured width', width);
 *   cleanup(() => console.log('cleanup'));
 * });
 * ```
 *
 * @example
 * Multi-phase (spec) form. Each phase receives the resolved deps as its first argument
 * and the previous phase's signal as the second:
 * ```typescript
 * explicitAfterRenderEffect(
 *   [el, width],
 *   {
 *     earlyRead: ([el]) => el.getBoundingClientRect().height,
 *     write:     ([el, width], prevHeight) => {
 *       el.style.width = `${width}px`;
 *       return prevHeight?.();
 *     },
 *     read: ([el]) => console.log('final size', el.getBoundingClientRect()),
 *   },
 * );
 * ```
 *
 * @param deps - Tuple of signals or signal-reading functions that the effect depends on
 * @param fnOrSpec - Either a single callback (run in the `read` phase) or a spec object with `earlyRead` / `write` / `mixedReadWrite` / `read` phases
 * @param options - Forwarded to `afterRenderEffect`
 */
export function explicitAfterRenderEffect<Input extends readonly unknown[]>(
	deps: ExplicitAfterRenderEffectValues<Input>,
	fn: (deps: Input, onCleanup: EffectCleanupRegisterFn) => void,
	options?: AfterRenderOptions,
): AfterRenderRef;

export function explicitAfterRenderEffect<
	Input extends readonly unknown[],
	E = never,
	W = never,
	M = never,
>(
	deps: ExplicitAfterRenderEffectValues<Input>,
	spec: {
		earlyRead?: (deps: Input, onCleanup: EffectCleanupRegisterFn) => E;
		write?: (
			deps: Input,
			prev: Signal<E> | undefined,
			onCleanup: EffectCleanupRegisterFn,
		) => W;
		mixedReadWrite?: (
			deps: Input,
			prev: Signal<W> | undefined,
			onCleanup: EffectCleanupRegisterFn,
		) => M;
		read?: (
			deps: Input,
			prev: Signal<M> | undefined,
			onCleanup: EffectCleanupRegisterFn,
		) => void;
	},
	options?: AfterRenderOptions,
): AfterRenderRef;

export function explicitAfterRenderEffect(
	deps: ReadonlyArray<() => unknown>,
	fnOrSpec:
		| ((values: readonly unknown[], onCleanup: EffectCleanupRegisterFn) => void)
		| {
				earlyRead?: (
					values: readonly unknown[],
					onCleanup: EffectCleanupRegisterFn,
				) => unknown;
				write?: (
					values: readonly unknown[],
					prev: Signal<unknown> | undefined,
					onCleanup: EffectCleanupRegisterFn,
				) => unknown;
				mixedReadWrite?: (
					values: readonly unknown[],
					prev: Signal<unknown> | undefined,
					onCleanup: EffectCleanupRegisterFn,
				) => unknown;
				read?: (
					values: readonly unknown[],
					prev: Signal<unknown> | undefined,
					onCleanup: EffectCleanupRegisterFn,
				) => void;
		  },
	options?: AfterRenderOptions,
): AfterRenderRef {
	if (typeof fnOrSpec === 'function') {
		return afterRenderEffect(
			{
				read: wrapPhase(deps, (values, _prev, onCleanup) =>
					fnOrSpec(values, onCleanup),
				),
			},
			options,
		);
	}

	return afterRenderEffect(
		{
			earlyRead: fnOrSpec.earlyRead
				? wrapEarlyReadPhase(deps, fnOrSpec.earlyRead)
				: undefined,
			write: fnOrSpec.write ? wrapPhase(deps, fnOrSpec.write) : undefined,
			mixedReadWrite: fnOrSpec.mixedReadWrite
				? wrapPhase(deps, fnOrSpec.mixedReadWrite)
				: undefined,
			read: fnOrSpec.read ? wrapPhase(deps, fnOrSpec.read) : undefined,
		},
		options,
	);
}
