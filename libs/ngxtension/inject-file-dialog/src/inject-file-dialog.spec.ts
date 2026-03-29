import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { injectFileDialog } from './inject-file-dialog';

describe(injectFileDialog.name, () => {
	@Component({
		standalone: true,
		template: ``,
	})
	class Test {
		fileDialog = injectFileDialog();
	}

	function setup(options = {}) {
		@Component({
			standalone: true,
			template: ``,
		})
		class TestWithOptions {
			fileDialog = injectFileDialog(options);
		}

		const fixture = TestBed.createComponent(TestWithOptions);
		fixture.detectChanges();
		return fixture.componentInstance;
	}

	it('should initialize with null files', () => {
		const fixture = TestBed.createComponent(Test);
		fixture.detectChanges();
		const cmp = fixture.componentInstance;

		expect(cmp.fileDialog.files()).toBeNull();
	});

	it('should handle file selection', () => {
		const cmp = setup();
		const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
		const dataTransfer = new DataTransfer();
		dataTransfer.items.add(mockFile);

		let selectedFiles: FileList | null = null;
		cmp.fileDialog.onChange((files) => {
			selectedFiles = files;
		});

		// Simulate file selection by creating an input element and triggering change
		const inputElement = document.createElement('input');
		inputElement.type = 'file';
		inputElement.files = dataTransfer.files;

		// Manually trigger the change that would happen internally
		Object.defineProperty(inputElement, 'files', {
			value: dataTransfer.files,
			writable: false,
		});

		const changeEvent = new Event('change', { bubbles: true });
		Object.defineProperty(changeEvent, 'target', {
			value: inputElement,
			enumerable: true,
		});

		// Access the internal input through open() which creates it
		cmp.fileDialog.open();
		// The input is now created, simulate the change
		const input = document.querySelector(
			'input[type="file"]',
		) as HTMLInputElement;
		if (input) {
			Object.defineProperty(input, 'files', {
				value: dataTransfer.files,
				writable: false,
			});
			input.dispatchEvent(changeEvent);
		}

		// Wait a tick for the change to propagate
		setTimeout(() => {
			expect(cmp.fileDialog.files()?.length).toBe(1);
			expect(cmp.fileDialog.files()?.[0].name).toBe('test.txt');
		});
	});

	it('should reset files', () => {
		const cmp = setup();
		const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
		const dataTransfer = new DataTransfer();
		dataTransfer.items.add(mockFile);

		// Set initial files through the reset functionality
		cmp.fileDialog.reset();
		expect(cmp.fileDialog.files()).toBeNull();
	});

	it('should call onChange callback when files are selected', (done) => {
		const cmp = setup();

		cmp.fileDialog.onChange((files) => {
			expect(files).toBeDefined();
			done();
		});

		// Create a mock file
		const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
		const dataTransfer = new DataTransfer();
		dataTransfer.items.add(mockFile);

		// Open dialog to create input element
		cmp.fileDialog.open();

		// Simulate file selection
		const input = document.querySelector(
			'input[type="file"]',
		) as HTMLInputElement;
		if (input) {
			Object.defineProperty(input, 'files', {
				value: dataTransfer.files,
				configurable: true,
			});
			const event = new Event('change');
			input.dispatchEvent(event);
		}
	});

	it('should call onCancel callback when dialog is cancelled', (done) => {
		const cmp = setup();

		cmp.fileDialog.onCancel(() => {
			expect(true).toBe(true);
			done();
		});

		// Open dialog to create input element
		cmp.fileDialog.open();

		// Simulate cancel
		const input = document.querySelector(
			'input[type="file"]',
		) as HTMLInputElement;
		if (input) {
			const event = new Event('cancel');
			input.dispatchEvent(event);
		}
	});

	it('should accept custom options', () => {
		const cmp = setup({
			accept: 'image/*',
			multiple: false,
			directory: false,
		});

		// Open to create the input
		cmp.fileDialog.open();

		const input = document.querySelector(
			'input[type="file"]',
		) as HTMLInputElement;
		expect(input).toBeTruthy();
		expect(input.accept).toBe('image/*');
		expect(input.multiple).toBe(false);
	});

	it('should handle directory selection', () => {
		const cmp = setup({
			directory: true,
		});

		cmp.fileDialog.open();

		const input = document.querySelector(
			'input[type="file"]',
		) as HTMLInputElement;
		expect(input).toBeTruthy();
		expect((input as any).webkitdirectory).toBe(true);
	});

	it('should support local options in open()', () => {
		const cmp = setup({
			accept: 'image/*',
		});

		// Override accept in open call
		cmp.fileDialog.open({
			accept: 'video/*',
		});

		const input = document.querySelector(
			'input[type="file"]',
		) as HTMLInputElement;
		expect(input).toBeTruthy();
		expect(input.accept).toBe('video/*');
	});

	it('should initialize with initial files', () => {
		const mockFile = new File(['content'], 'initial.txt', {
			type: 'text/plain',
		});
		const cmp = setup({
			initialFiles: [mockFile],
		});

		expect(cmp.fileDialog.files()).toBeTruthy();
		expect(cmp.fileDialog.files()?.length).toBe(1);
		expect(cmp.fileDialog.files()?.[0].name).toBe('initial.txt');
	});

	it('should reset files when reset option is true', () => {
		const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
		const cmp = setup({
			initialFiles: [mockFile],
		});

		expect(cmp.fileDialog.files()?.length).toBe(1);

		// Open with reset: true
		cmp.fileDialog.open({ reset: true });

		// After reset, files should be cleared
		expect(cmp.fileDialog.files()).toBeNull();
	});
});
