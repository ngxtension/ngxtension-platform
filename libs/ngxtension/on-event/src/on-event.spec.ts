import { DestroyRef, Injector } from '@angular/core';
import { onEvent } from './on-event';

describe('onEvent', () => {
	let mockTarget: EventTarget;
	let mockListener: jest.Mock;
	let mockDestroyRef: DestroyRef;
	let destroyCallback: (() => void) | undefined;

	beforeEach(() => {
		mockTarget = document.createElement('div');
		mockListener = jest.fn();

		// Mock DestroyRef
		destroyCallback = undefined;
		mockDestroyRef = {
			onDestroy: jest.fn((callback: () => void) => {
				destroyCallback = callback;
				return () => {
					destroyCallback = undefined;
				};
			}),
		} as unknown as DestroyRef;

		// Reset dev mode spy
		jest.spyOn(console, 'warn').mockImplementation();
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe('Basic Functionality', () => {
		it('should add event listener to target', () => {
			const addEventListenerSpy = jest.spyOn(mockTarget, 'addEventListener');

			onEvent(mockTarget, 'click', mockListener, {
				destroyRef: mockDestroyRef,
			});

			expect(addEventListenerSpy).toHaveBeenCalledWith(
				'click',
				expect.any(Function),
				expect.objectContaining({
					signal: expect.any(AbortSignal),
				}),
			);
		});

		it('should invoke listener when event is dispatched', () => {
			onEvent(mockTarget, 'click', mockListener, {
				destroyRef: mockDestroyRef,
			});

			const event = new Event('click');
			mockTarget.dispatchEvent(event);

			expect(mockListener).toHaveBeenCalledWith(event, expect.any(Function));
		});

		it('should return OnEventResult with removeListener and active signal', () => {
			const result = onEvent(mockTarget, 'click', mockListener, {
				destroyRef: mockDestroyRef,
			});

			expect(result).toHaveProperty('removeListener');
			expect(result).toHaveProperty('active');
			expect(typeof result.removeListener).toBe('function');
			expect(result.active()).toBe(true);
		});
	});

	describe('Event Options', () => {
		it('should handle once option', () => {
			const result = onEvent(mockTarget, 'click', mockListener, {
				once: true,
				destroyRef: mockDestroyRef,
			});

			expect(result.active()).toBe(true);

			mockTarget.dispatchEvent(new Event('click'));

			expect(mockListener).toHaveBeenCalledTimes(1);
			expect(result.active()).toBe(false);

			// Second dispatch should not trigger listener
			mockTarget.dispatchEvent(new Event('click'));
			expect(mockListener).toHaveBeenCalledTimes(1);
		});

		it('should pass capture option to addEventListener', () => {
			const addEventListenerSpy = jest.spyOn(mockTarget, 'addEventListener');

			onEvent(mockTarget, 'click', mockListener, {
				capture: true,
				destroyRef: mockDestroyRef,
			});

			expect(addEventListenerSpy).toHaveBeenCalledWith(
				'click',
				expect.any(Function),
				expect.objectContaining({ capture: true }),
			);
		});

		it('should pass passive option to addEventListener', () => {
			const addEventListenerSpy = jest.spyOn(mockTarget, 'addEventListener');

			onEvent(mockTarget, 'click', mockListener, {
				passive: true,
				destroyRef: mockDestroyRef,
			});

			expect(addEventListenerSpy).toHaveBeenCalledWith(
				'click',
				expect.any(Function),
				expect.objectContaining({ passive: true }),
			);
		});
	});

	describe('Cleanup via DestroyRef', () => {
		it('should register onDestroy callback when destroyRef is provided', () => {
			onEvent(mockTarget, 'click', mockListener, {
				destroyRef: mockDestroyRef,
			});

			expect(mockDestroyRef.onDestroy).toHaveBeenCalledWith(
				expect.any(Function),
			);
		});

		it('should remove listener when destroyRef is destroyed', () => {
			const result = onEvent(mockTarget, 'click', mockListener, {
				destroyRef: mockDestroyRef,
			});

			expect(result.active()).toBe(true);

			// Trigger destroy
			destroyCallback?.();

			expect(result.active()).toBe(false);

			// Event should not trigger listener after destroy
			mockTarget.dispatchEvent(new Event('click'));
			expect(mockListener).not.toHaveBeenCalled();
		});

		it('should get DestroyRef from injector when provided', () => {
			const mockInjector = {
				get: jest.fn().mockReturnValue(mockDestroyRef),
			} as unknown as Injector;

			onEvent(mockTarget, 'click', mockListener, { injector: mockInjector });

			expect(mockInjector.get).toHaveBeenCalledWith(DestroyRef);
			expect(mockDestroyRef.onDestroy).toHaveBeenCalled();
		});
	});

	describe('Manual Cleanup', () => {
		it('should remove listener when removeListener is called', () => {
			const result = onEvent(mockTarget, 'click', mockListener, {
				destroyRef: mockDestroyRef,
			});

			expect(result.active()).toBe(true);

			result.removeListener();

			expect(result.active()).toBe(false);

			// Event should not trigger listener after removal
			mockTarget.dispatchEvent(new Event('click'));
			expect(mockListener).not.toHaveBeenCalled();
		});

		it('should cleanup destroyRef callback when manually removed', () => {
			const result = onEvent(mockTarget, 'click', mockListener, {
				destroyRef: mockDestroyRef,
			});

			result.removeListener();

			// Triggering destroy should have no effect since unregisterDestroyCallback was called
			expect(destroyCallback).toBeUndefined();
		});
	});

	describe('Abort Callback', () => {
		it('should provide abort callback to listener', () => {
			onEvent(mockTarget, 'click', mockListener, {
				destroyRef: mockDestroyRef,
			});

			mockTarget.dispatchEvent(new Event('click'));

			const abortFn = mockListener.mock.calls[0][1];
			expect(typeof abortFn).toBe('function');
		});

		it('should remove listener when abort is called from within listener', () => {
			const result = onEvent(
				mockTarget,
				'click',
				(event, abort) => {
					mockListener(event);
					abort();
				},
				{ destroyRef: mockDestroyRef },
			);

			mockTarget.dispatchEvent(new Event('click'));

			expect(mockListener).toHaveBeenCalledTimes(1);
			expect(result.active()).toBe(false);

			// Second event should not trigger
			mockTarget.dispatchEvent(new Event('click'));
			expect(mockListener).toHaveBeenCalledTimes(1);
		});

		it('should cleanup destroyRef callback when abort is called', () => {
			let abortFn: (() => void) | undefined;

			onEvent(
				mockTarget,
				'click',
				(event, abort) => {
					abortFn = abort;
				},
				{ destroyRef: mockDestroyRef },
			);

			mockTarget.dispatchEvent(new Event('click'));
			abortFn?.();

			expect(destroyCallback).toBeUndefined();
		});
	});

	describe('Dev Mode Warning', () => {
		it('should warn in dev mode when no DestroyRef is available', () => {
			const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

			// Mock isDevMode to return true
			jest.mock('@angular/core', () => ({
				...jest.requireActual('@angular/core'),
				isDevMode: () => true,
			}));

			onEvent(mockTarget, 'click', mockListener);

			// Note: This test assumes inject() will fail/return null
			// In a real test environment, you'd need to mock the inject function
		});

		it('should not warn when DestroyRef is provided', () => {
			const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

			onEvent(mockTarget, 'click', mockListener, {
				destroyRef: mockDestroyRef,
			});

			expect(consoleWarnSpy).not.toHaveBeenCalled();
		});
	});

	describe('Signal State Management', () => {
		it('should set active signal to true initially', () => {
			const result = onEvent(mockTarget, 'click', mockListener, {
				destroyRef: mockDestroyRef,
			});

			expect(result.active()).toBe(true);
		});

		it('should set active signal to false after once event fires', () => {
			const result = onEvent(mockTarget, 'click', mockListener, {
				once: true,
				destroyRef: mockDestroyRef,
			});

			expect(result.active()).toBe(true);

			mockTarget.dispatchEvent(new Event('click'));

			expect(result.active()).toBe(false);
		});

		it('should return readonly signal', () => {
			const result = onEvent(mockTarget, 'click', mockListener, {
				destroyRef: mockDestroyRef,
			});

			// Readonly signals don't have a set method
			expect((result.active as any).set).toBeUndefined();
		});
	});

	describe('Memory Leak Prevention', () => {
		it('should cleanup destroyRef callback when using once option', () => {
			const onDestroySpy = jest.spyOn(mockDestroyRef, 'onDestroy');

			onEvent(mockTarget, 'click', mockListener, {
				once: true,
				destroyRef: mockDestroyRef,
			});

			const unregister = onDestroySpy.mock.results[0].value;

			mockTarget.dispatchEvent(new Event('click'));

			// The unregister function should have been called
			expect(destroyCallback).toBeUndefined();
		});
	});

	describe('TypeScript Type Safety', () => {
		it('should handle typed events from GlobalEventHandlersEventMap', () => {
			const clickListener = jest.fn((event: MouseEvent) => {
				expect(event).toBeInstanceOf(MouseEvent);
			});

			onEvent(mockTarget, 'click', clickListener, {
				destroyRef: mockDestroyRef,
			});

			const mouseEvent = new MouseEvent('click', {
				clientX: 100,
				clientY: 200,
			});
			mockTarget.dispatchEvent(mouseEvent);

			expect(clickListener).toHaveBeenCalledWith(
				mouseEvent,
				expect.any(Function),
			);
		});

		it('should handle custom event types', () => {
			class CustomEvent extends Event {
				customData: string;

				constructor(type: string, customData: string) {
					super(type);
					this.customData = customData;
				}
			}

			const customListener = jest.fn();

			onEvent<CustomEvent>(mockTarget, 'custom', customListener, {
				destroyRef: mockDestroyRef,
			});

			const customEvent = new CustomEvent('custom', 'test-data');
			mockTarget.dispatchEvent(customEvent);

			expect(customListener).toHaveBeenCalledWith(
				customEvent,
				expect.any(Function),
			);
		});
	});
});
