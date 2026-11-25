# injectClipboardItems

Reactive [Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API) with [ClipboardItem](https://developer.mozilla.org/en-US/docs/Web/API/ClipboardItem) support for Angular. Provides the ability to respond to clipboard commands (cut, copy, and paste) as well as to asynchronously read from and write to the system clipboard with support for rich content like images and HTML.

## Difference from `injectClipboard`

`injectClipboard` is a text-only function, while `injectClipboardItems` is a [ClipboardItem](https://developer.mozilla.org/en-US/docs/Web/API/ClipboardItem)-based function. You can use `injectClipboardItems` to copy any content supported by [ClipboardItem](https://developer.mozilla.org/en-US/docs/Web/API/ClipboardItem), including:

- Plain text
- HTML content
- Images (PNG, JPEG, etc.)
- Multiple formats simultaneously
- Custom MIME types

```ts
import { injectClipboardItems } from 'ngxtension/inject-clipboard-items';
```

## Usage

### Basic Text Copy

```ts
import { Component, effect } from '@angular/core';
import { injectClipboardItems } from 'ngxtension/inject-clipboard-items';

@Component({
	selector: 'app-text-copy',
	standalone: true,
	template: `
		<div *ngIf="clipboard.isSupported()">
			<input #input type="text" placeholder="Enter text" />
			<button (click)="copyText(input.value)">
				{{ clipboard.copied() ? 'Copied!' : 'Copy' }}
			</button>
		</div>
		<p *ngIf="!clipboard.isSupported()">
			Your browser does not support Clipboard API
		</p>
	`,
})
export class TextCopyComponent {
	clipboard = injectClipboardItems();

	constructor() {
		effect(() => {
			if (this.clipboard.copied()) {
				console.log('Content copied successfully!');
			}
		});
	}

	async copyText(text: string) {
		const blob = new Blob([text], { type: 'text/plain' });
		const item = new ClipboardItem({ 'text/plain': blob });
		await this.clipboard.copy([item]);
	}
}
```

### Copy HTML Content

```ts
import { Component } from '@angular/core';
import { injectClipboardItems } from 'ngxtension/inject-clipboard-items';

@Component({
	selector: 'app-html-copy',
	standalone: true,
	template: `
		<button (click)="copyHtml()">Copy Rich Text</button>
	`,
})
export class HtmlCopyComponent {
	clipboard = injectClipboardItems();

	async copyHtml() {
		const htmlContent = '<h1>Hello</h1><p>This is <strong>bold</strong> text</p>';
		const plainText = 'Hello\nThis is bold text';

		const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
		const textBlob = new Blob([plainText], { type: 'text/plain' });

		const item = new ClipboardItem({
			'text/html': htmlBlob,
			'text/plain': textBlob,
		});

		await this.clipboard.copy([item]);
	}
}
```

### Copy Images

```ts
import { Component } from '@angular/core';
import { injectClipboardItems } from 'ngxtension/inject-clipboard-items';

@Component({
	selector: 'app-image-copy',
	standalone: true,
	template: `
		<img #img src="/path/to/image.png" alt="Image" />
		<button (click)="copyImage(img)">Copy Image</button>
	`,
})
export class ImageCopyComponent {
	clipboard = injectClipboardItems();

	async copyImage(imgElement: HTMLImageElement) {
		try {
			const response = await fetch(imgElement.src);
			const blob = await response.blob();
			const item = new ClipboardItem({ [blob.type]: blob });
			await this.clipboard.copy([item]);
		} catch (error) {
			console.error('Failed to copy image:', error);
		}
	}
}
```

### With Source Option

```ts
import { Component, signal } from '@angular/core';
import { injectClipboardItems } from 'ngxtension/inject-clipboard-items';

@Component({
	selector: 'app-with-source',
	standalone: true,
	template: `
		<button (click)="clipboard.copy()">
			{{ clipboard.copied() ? 'Copied!' : 'Copy Default' }}
		</button>
	`,
})
export class WithSourceComponent {
	source = signal<ClipboardItems>([
		new ClipboardItem({
			'text/plain': new Blob(['Default text'], { type: 'text/plain' }),
		}),
	]);

	clipboard = injectClipboardItems({ source: this.source() });
}
```

### Monitor Clipboard Changes

```ts
import { Component, effect } from '@angular/core';
import { injectClipboardItems } from 'ngxtension/inject-clipboard-items';

@Component({
	selector: 'app-monitor-clipboard',
	standalone: true,
	template: `
		<div>
			<p>Clipboard content:</p>
			<pre>{{ contentPreview() }}</pre>
			<button (click)="clipboard.read()">Manual Read</button>
		</div>
	`,
})
export class MonitorClipboardComponent {
	clipboard = injectClipboardItems({ read: true });
	contentPreview = signal<string>('No content');

	constructor() {
		effect(() => {
			const items = this.clipboard.content();
			if (items.length > 0) {
				this.processClipboardItems(items);
			}
		});
	}

	async processClipboardItems(items: ClipboardItems) {
		try {
			const item = items[0];
			const types = item.types;

			if (types.includes('text/plain')) {
				const blob = await item.getType('text/plain');
				const text = await blob.text();
				this.contentPreview.set(`Text: ${text}`);
			} else if (types.some((type) => type.startsWith('image/'))) {
				const imageType = types.find((type) => type.startsWith('image/'));
				this.contentPreview.set(`Image (${imageType})`);
			} else {
				this.contentPreview.set(`Other: ${types.join(', ')}`);
			}
		} catch (error) {
			console.error('Failed to read clipboard:', error);
		}
	}
}
```

### Canvas to Clipboard

```ts
import { Component, ElementRef, ViewChild } from '@angular/core';
import { injectClipboardItems } from 'ngxtension/inject-clipboard-items';

@Component({
	selector: 'app-canvas-copy',
	standalone: true,
	template: `
		<canvas #canvas width="200" height="200"></canvas>
		<button (click)="copyCanvas()">Copy Canvas</button>
	`,
})
export class CanvasCopyComponent {
	@ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
	clipboard = injectClipboardItems();

	ngAfterViewInit() {
		// Draw something on canvas
		const ctx = this.canvasRef.nativeElement.getContext('2d')!;
		ctx.fillStyle = 'blue';
		ctx.fillRect(50, 50, 100, 100);
	}

	async copyCanvas() {
		const canvas = this.canvasRef.nativeElement;

		canvas.toBlob(async (blob) => {
			if (blob) {
				const item = new ClipboardItem({ 'image/png': blob });
				await this.clipboard.copy([item]);
			}
		});
	}
}
```

## API

### Options

```ts
interface InjectClipboardItemsOptions<Source> {
	/**
	 * Enabled reading for clipboard
	 * @default false
	 */
	read?: boolean;

	/**
	 * Copy source - default ClipboardItems to copy
	 */
	source?: Source;

	/**
	 * Milliseconds to reset state of `copied` signal
	 * @default 1500
	 */
	copiedDuring?: number;

	/**
	 * Custom Injector instance
	 */
	injector?: Injector;
}
```

### Returns

```ts
interface InjectClipboardItemsReturn<Optional> {
	/**
	 * Whether the Clipboard API with ClipboardItem support is available
	 */
	isSupported: Signal<boolean>;

	/**
	 * Current clipboard content as ClipboardItems
	 */
	content: Signal<ClipboardItems>;

	/**
	 * Whether the last copy operation was successful
	 * Automatically resets to false after `copiedDuring` milliseconds
	 */
	copied: Signal<boolean>;

	/**
	 * Copy ClipboardItems to clipboard
	 */
	copy: (items?: ClipboardItems) => Promise<void>;

	/**
	 * Manually read the current clipboard content
	 */
	read: () => void;
}
```

## Browser Support

This function requires browser support for:

- [Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API)
- [ClipboardItem](https://developer.mozilla.org/en-US/docs/Web/API/ClipboardItem)

Most modern browsers support these APIs, but you should check `isSupported()` before using the functionality.

## Permissions

The Clipboard API requires user permissions:

- `clipboard-read`: Required for reading clipboard content
- `clipboard-write`: Required for writing to clipboard

The function will automatically handle permission checks. Users may be prompted to grant permissions on first use.

## Notes

- Reading clipboard content (`read` option) requires the `clipboard-read` permission
- Writing to clipboard requires the `clipboard-write` permission
- Some browsers may restrict clipboard access to secure contexts (HTTPS)
- The `copied` signal automatically resets after `copiedDuring` milliseconds (default: 1500ms)
- Multiple MIME types can be provided in a single ClipboardItem for better compatibility
- Images and other binary content should be converted to Blob objects before copying
