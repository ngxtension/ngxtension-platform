import { Component, effect } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { injectBroadcastChannel } from './inject-broadcast-channel';

describe(injectBroadcastChannel.name, () => {
	describe('when BroadcastChannel is supported', () => {
		@Component({
			standalone: true,
			template: `
				<div>
					<p>Supported: {{ channel.isSupported() }}</p>
					<p>Data: {{ channel.data() }}</p>
					<p>Closed: {{ channel.isClosed() }}</p>
				</div>
			`,
		})
		class TestComponent {
			channel = injectBroadcastChannel<string>({
				name: 'test-channel',
			});
		}

		function setup() {
			const fixture = TestBed.createComponent(TestComponent);
			fixture.detectChanges();
			return { fixture, component: fixture.componentInstance };
		}

		it('should create a broadcast channel', () => {
			const { component } = setup();
			expect(component.channel.isSupported()).toBe(true);
			expect(component.channel.channel()).toBeInstanceOf(BroadcastChannel);
			expect(component.channel.isClosed()).toBe(false);
		});

		it('should receive messages from another channel', (done) => {
			const { component } = setup();

			// Create another channel with the same name
			const otherChannel = new BroadcastChannel('test-channel');

			// Subscribe to data changes
			effect(() => {
				const data = component.channel.data();
				if (data === 'Hello from other channel') {
					expect(data).toBe('Hello from other channel');
					otherChannel.close();
					done();
				}
			});

			// Post message from the other channel
			setTimeout(() => {
				otherChannel.postMessage('Hello from other channel');
			}, 100);
		});

		it('should post messages to other channels', (done) => {
			const { component } = setup();

			// Create another channel with the same name
			const otherChannel = new BroadcastChannel('test-channel');

			// Listen for messages on the other channel
			otherChannel.onmessage = (event) => {
				expect(event.data).toBe('Hello from component');
				otherChannel.close();
				done();
			};

			// Post message from the component
			component.channel.post('Hello from component');
		});

		it('should close the channel', () => {
			const { component } = setup();

			expect(component.channel.isClosed()).toBe(false);
			component.channel.close();
			expect(component.channel.isClosed()).toBe(true);
		});

		it('should not post messages after closing', () => {
			const { component } = setup();

			// Create another channel to verify no message is sent
			const otherChannel = new BroadcastChannel('test-channel');
			let messageReceived = false;

			otherChannel.onmessage = () => {
				messageReceived = true;
			};

			// Close the channel and try to post
			component.channel.close();
			component.channel.post('Should not be sent');

			// Wait a bit to ensure no message was sent
			setTimeout(() => {
				expect(messageReceived).toBe(false);
				otherChannel.close();
			}, 100);
		});

		it('should handle multiple channels with different names', () => {
			@Component({
				standalone: true,
				template: ``,
			})
			class MultiChannelComponent {
				channel1 = injectBroadcastChannel({ name: 'channel-1' });
				channel2 = injectBroadcastChannel({ name: 'channel-2' });
			}

			const fixture = TestBed.createComponent(MultiChannelComponent);
			fixture.detectChanges();
			const component = fixture.componentInstance;

			expect(component.channel1.channel()).not.toBe(
				component.channel2.channel(),
			);
			expect(component.channel1.isSupported()).toBe(true);
			expect(component.channel2.isSupported()).toBe(true);
		});

		it('should clean up on component destroy', () => {
			const { fixture, component } = setup();
			const channel = component.channel.channel();

			expect(channel).toBeInstanceOf(BroadcastChannel);
			expect(component.channel.isClosed()).toBe(false);

			// Spy on the close method
			const closeSpy = jest.spyOn(channel!, 'close');

			// Destroy the component
			fixture.destroy();

			// The channel should be closed on destroy
			expect(closeSpy).toHaveBeenCalled();
		});
	});

	describe('when BroadcastChannel is not supported', () => {
		it('should indicate lack of support', () => {
			// Mock window without BroadcastChannel
			const mockWindow = {} as Window;

			@Component({
				standalone: true,
				template: ``,
			})
			class TestComponent {
				channel = injectBroadcastChannel({
					name: 'test-channel',
					window: mockWindow,
				});
			}

			const fixture = TestBed.createComponent(TestComponent);
			fixture.detectChanges();
			const component = fixture.componentInstance;

			expect(component.channel.isSupported()).toBe(false);
			expect(component.channel.channel()).toBeUndefined();
		});
	});
});
