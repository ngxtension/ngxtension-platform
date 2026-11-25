import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { injectShare, type InjectShareOptions } from './inject-share';

describe(injectShare.name, () => {
	@Component({
		standalone: true,
		template: '',
	})
	class TestComponent {
		share = injectShare();
	}

	@Component({
		standalone: true,
		template: '',
	})
	class TestComponentWithOptions {
		share = injectShare({
			shareOptions: {
				title: 'Default Title',
				text: 'Default Text',
			},
		});
	}

	function setup() {
		const fixture = TestBed.createComponent(TestComponent);
		fixture.detectChanges();
		return fixture.componentInstance;
	}

	function setupWithOptions() {
		const fixture = TestBed.createComponent(TestComponentWithOptions);
		fixture.detectChanges();
		return fixture.componentInstance;
	}

	it('should be supported or not based on navigator', () => {
		const cmp = setup();
		// In test environments, canShare may not be available
		expect(typeof cmp.share.isSupported()).toBe('boolean');
	});

	it('should initialize correctly', () => {
		const cmp = setup();
		expect(cmp.share.isSupported).toBeDefined();
		expect(cmp.share.share).toBeDefined();
		expect(typeof cmp.share.share).toBe('function');
	});

	it('should handle share call when not supported', async () => {
		const cmp = setup();

		// Mock navigator without canShare
		Object.defineProperty(window.navigator, 'canShare', {
			value: undefined,
			configurable: true,
		});

		// Should not throw when calling share if not supported
		await expect(
			cmp.share.share({
				title: 'Test',
				text: 'Test content',
			}),
		).resolves.not.toThrow();
	});

	it('should call navigator.share when supported and granted', async () => {
		const cmp = setup();

		const mockShare = jest.fn().mockResolvedValue(undefined);
		const mockCanShare = jest.fn().mockReturnValue(true);

		Object.defineProperty(window.navigator, 'share', {
			value: mockShare,
			configurable: true,
			writable: true,
		});

		Object.defineProperty(window.navigator, 'canShare', {
			value: mockCanShare,
			configurable: true,
			writable: true,
		});

		const shareData: InjectShareOptions = {
			title: 'Test Title',
			text: 'Test Text',
			url: 'https://example.com',
		};

		await cmp.share.share(shareData);

		expect(mockCanShare).toHaveBeenCalledWith(shareData);
		expect(mockShare).toHaveBeenCalledWith(shareData);
	});

	it('should not call navigator.share when canShare returns false', async () => {
		const cmp = setup();

		const mockShare = jest.fn().mockResolvedValue(undefined);
		const mockCanShare = jest.fn().mockReturnValue(false);

		Object.defineProperty(window.navigator, 'share', {
			value: mockShare,
			configurable: true,
			writable: true,
		});

		Object.defineProperty(window.navigator, 'canShare', {
			value: mockCanShare,
			configurable: true,
			writable: true,
		});

		const shareData: InjectShareOptions = {
			title: 'Test Title',
			text: 'Test Text',
		};

		await cmp.share.share(shareData);

		expect(mockCanShare).toHaveBeenCalledWith(shareData);
		expect(mockShare).not.toHaveBeenCalled();
	});

	it('should merge default options with override options', async () => {
		const cmp = setupWithOptions();

		const mockShare = jest.fn().mockResolvedValue(undefined);
		const mockCanShare = jest.fn().mockReturnValue(true);

		Object.defineProperty(window.navigator, 'share', {
			value: mockShare,
			configurable: true,
			writable: true,
		});

		Object.defineProperty(window.navigator, 'canShare', {
			value: mockCanShare,
			configurable: true,
			writable: true,
		});

		await cmp.share.share({ url: 'https://example.com' });

		expect(mockShare).toHaveBeenCalledWith({
			title: 'Default Title',
			text: 'Default Text',
			url: 'https://example.com',
		});
	});

	it('should override default options', async () => {
		const cmp = setupWithOptions();

		const mockShare = jest.fn().mockResolvedValue(undefined);
		const mockCanShare = jest.fn().mockReturnValue(true);

		Object.defineProperty(window.navigator, 'share', {
			value: mockShare,
			configurable: true,
			writable: true,
		});

		Object.defineProperty(window.navigator, 'canShare', {
			value: mockCanShare,
			configurable: true,
			writable: true,
		});

		await cmp.share.share({
			title: 'Override Title',
			text: 'Override Text',
		});

		expect(mockShare).toHaveBeenCalledWith({
			title: 'Override Title',
			text: 'Override Text',
		});
	});

	it('should support sharing files', async () => {
		const cmp = setup();

		const mockShare = jest.fn().mockResolvedValue(undefined);
		const mockCanShare = jest.fn().mockReturnValue(true);

		Object.defineProperty(window.navigator, 'share', {
			value: mockShare,
			configurable: true,
			writable: true,
		});

		Object.defineProperty(window.navigator, 'canShare', {
			value: mockCanShare,
			configurable: true,
			writable: true,
		});

		const file = new File(['test'], 'test.txt', { type: 'text/plain' });
		const shareData: InjectShareOptions = {
			files: [file],
			title: 'Share File',
		};

		await cmp.share.share(shareData);

		expect(mockCanShare).toHaveBeenCalledWith(shareData);
		expect(mockShare).toHaveBeenCalledWith(shareData);
	});

	it('should handle empty share call with no options', async () => {
		const cmp = setup();

		const mockShare = jest.fn().mockResolvedValue(undefined);
		const mockCanShare = jest.fn().mockReturnValue(true);

		Object.defineProperty(window.navigator, 'share', {
			value: mockShare,
			configurable: true,
			writable: true,
		});

		Object.defineProperty(window.navigator, 'canShare', {
			value: mockCanShare,
			configurable: true,
			writable: true,
		});

		await cmp.share.share();

		expect(mockCanShare).toHaveBeenCalledWith({});
		expect(mockShare).toHaveBeenCalledWith({});
	});

	it('should return readonly signal for isSupported', () => {
		const cmp = setup();

		expect(cmp.share.isSupported).toBeDefined();
		expect(typeof cmp.share.isSupported()).toBe('boolean');
	});
});
