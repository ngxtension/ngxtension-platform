# ngxtension/inject-color-mode

Reactive color mode (dark / light / custom) with auto data persistence.

```ts
import { injectColorMode } from 'ngxtension/inject-color-mode';
```

## Features

- Reactive color mode management with Angular signals
- Automatic persistence to localStorage
- System preference detection via `prefers-color-scheme`
- Auto mode that follows system preference
- Customizable HTML attribute/class manipulation
- Support for custom color modes
- Cross-tab synchronization
- TypeScript support with type-safe custom modes
- Transition disabling during mode switches
- Custom change handlers

## Usage

### Basic Usage

```ts
import { Component } from '@angular/core';
import { injectColorMode } from 'ngxtension/inject-color-mode';

@Component({
  selector: 'app-root',
  template: `
    <div>
      <p>Current mode: {{ colorMode.mode() }}</p>
      <p>System preference: {{ colorMode.system() }}</p>
      <button (click)="colorMode.mode.set('light')">Light</button>
      <button (click)="colorMode.mode.set('dark')">Dark</button>
      <button (click)="colorMode.mode.set('auto')">Auto</button>
    </div>
  `,
})
export class AppComponent {
  colorMode = injectColorMode();
}
```

By default, `injectColorMode` will:
- Initialize with `auto` mode (follows system preference)
- Add `light` or `dark` class to the `<html>` element
- Persist the selected mode to localStorage
- Sync changes across browser tabs

### Reading Values

The returned object provides four signal properties:

```ts
const colorMode = injectColorMode();

// The current mode (writable signal)
console.log(colorMode.mode()); // 'dark' | 'light' | 'auto'

// The stored value (readonly signal, includes 'auto')
console.log(colorMode.store()); // 'dark' | 'light' | 'auto'

// The system preference (readonly signal)
console.log(colorMode.system()); // 'dark' | 'light'

// The resolved state (readonly signal, never 'auto')
console.log(colorMode.state()); // 'dark' | 'light'
```

### Changing Mode

```ts
const colorMode = injectColorMode();

// Set to dark mode
colorMode.mode.set('dark');

// Set to light mode
colorMode.mode.set('light');

// Set to auto (follow system preference)
colorMode.mode.set('auto');

// Toggle between light and dark
colorMode.mode.update((current) => (current === 'light' ? 'dark' : 'light'));
```

## Configuration

### Custom Attribute

Use a data attribute instead of class:

```ts
const colorMode = injectColorMode({
  attribute: 'data-theme',
});
// Sets: <html data-theme="dark">
```

### Custom Selector

Apply the mode to a different element:

```ts
const colorMode = injectColorMode({
  selector: '#app',
});
// Applies class to #app instead of <html>
```

### Custom Storage Key

```ts
const colorMode = injectColorMode({
  storageKey: 'my-app-theme',
});
```

### Disable Persistence

```ts
const colorMode = injectColorMode({
  storageKey: null,
});
// Mode changes won't be saved to localStorage
```

### Initial Value

```ts
const colorMode = injectColorMode({
  initialValue: 'dark',
});
// Starts with dark mode if no saved preference exists
```

### Custom Modes

Define custom color modes beyond light/dark:

```ts
const colorMode = injectColorMode<'light' | 'dark' | 'dim' | 'cafe'>({
  modes: {
    auto: '',
    light: 'light',
    dark: 'dark',
    dim: 'dim',
    cafe: 'cafe',
  },
});

colorMode.mode.set('dim');
colorMode.mode.set('cafe');
```

### Multiple Classes

Apply multiple CSS classes for a mode:

```ts
const colorMode = injectColorMode({
  modes: {
    light: 'light theme-light',
    dark: 'dark theme-dark',
  },
});
// Sets: <html class="dark theme-dark">
```

### Custom Change Handler

Override or extend the default behavior:

```ts
const colorMode = injectColorMode({
  onChanged: (mode, defaultHandler) => {
    console.log(`Color mode changed to: ${mode}`);

    // Call default handler to update HTML
    defaultHandler(mode);

    // Add custom logic
    document.body.style.backgroundColor = mode === 'dark' ? '#000' : '#fff';
  },
});
```

### Disable Transitions

By default, CSS transitions are disabled during mode changes to prevent flash effects. You can enable transitions:

```ts
const colorMode = injectColorMode({
  disableTransition: false,
});
```

### Disable Cross-Tab Sync

```ts
const colorMode = injectColorMode({
  storageSync: false,
});
// Changes won't sync across browser tabs
```

## Advanced Usage

### Accessing System Preference

You can access the system preference directly:

```ts
const colorMode = injectColorMode();

effect(() => {
  console.log(`System prefers: ${colorMode.system()}`);
});
```

### Distinguishing Store from State

- `store`: The actual stored value (can be 'auto')
- `state`: The resolved value ('auto' becomes 'light' or 'dark')

```ts
const colorMode = injectColorMode();

colorMode.mode.set('auto');
console.log(colorMode.store()); // 'auto'
console.log(colorMode.state()); // 'dark' or 'light' (based on system)
```

### Using with Effects

```ts
const colorMode = injectColorMode();

effect(() => {
  const mode = colorMode.state();
  console.log(`Current resolved mode: ${mode}`);
  // Perform side effects based on mode
});
```

### Complete Example

```ts
import { Component, effect } from '@angular/core';
import { injectColorMode } from 'ngxtension/inject-color-mode';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  template: `
    <div class="theme-switcher">
      <h2>Theme Settings</h2>

      <div class="current-info">
        <p>Current Mode: <strong>{{ colorMode.mode() }}</strong></p>
        <p>System Preference: <strong>{{ colorMode.system() }}</strong></p>
        <p>Resolved State: <strong>{{ colorMode.state() }}</strong></p>
        <p>Stored Value: <strong>{{ colorMode.store() }}</strong></p>
      </div>

      <div class="controls">
        <button
          (click)="setMode('light')"
          [class.active]="colorMode.store() === 'light'">
          Light
        </button>
        <button
          (click)="setMode('dark')"
          [class.active]="colorMode.store() === 'dark'">
          Dark
        </button>
        <button
          (click)="setMode('auto')"
          [class.active]="colorMode.store() === 'auto'">
          Auto
        </button>
      </div>
    </div>
  `,
  styles: [`
    .theme-switcher {
      padding: 20px;
      border-radius: 8px;
      background: var(--surface);
    }

    .controls button {
      margin: 5px;
      padding: 10px 20px;
      border: 2px solid var(--border);
      background: var(--button-bg);
      color: var(--text);
      cursor: pointer;
    }

    .controls button.active {
      border-color: var(--primary);
      background: var(--primary);
      color: white;
    }
  `]
})
export class ThemeSwitcherComponent {
  colorMode = injectColorMode();

  constructor() {
    // React to mode changes
    effect(() => {
      const mode = this.colorMode.state();
      console.log(`Theme changed to: ${mode}`);

      // Update meta theme-color
      this.updateMetaThemeColor(mode);
    });
  }

  setMode(mode: 'light' | 'dark' | 'auto') {
    this.colorMode.mode.set(mode);
  }

  private updateMetaThemeColor(mode: string) {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        mode === 'dark' ? '#1a1a1a' : '#ffffff'
      );
    }
  }
}
```

## CSS Integration

Your CSS can respond to the applied classes:

```css
/* Default light theme */
:root {
  --bg: #ffffff;
  --text: #000000;
  --primary: #0066cc;
}

/* Dark theme */
html.dark {
  --bg: #1a1a1a;
  --text: #ffffff;
  --primary: #4da6ff;
}

body {
  background-color: var(--bg);
  color: var(--text);
}
```

Or with data attributes:

```css
html[data-theme="light"] {
  --bg: #ffffff;
  --text: #000000;
}

html[data-theme="dark"] {
  --bg: #1a1a1a;
  --text: #ffffff;
}
```

## API

### `injectColorMode<T extends string = BasicColorMode>(options?)`

#### Type Parameters

- `T` - Union type of custom color modes (e.g., `'light' | 'dark' | 'dim'`)

#### Parameters

- `options?: InjectColorModeOptions<T>` - Configuration options

#### Returns

`InjectColorModeReturn<T>` - Object with the following properties:

- `mode: WritableSignal<T | BasicColorSchema>` - The current color mode (writable)
- `store: Signal<T | BasicColorSchema>` - The stored value (readonly)
- `system: Signal<BasicColorMode>` - The system preference (readonly)
- `state: Signal<T | BasicColorMode>` - The resolved state (readonly)

### Options

```ts
interface InjectColorModeOptions<T extends string = BasicColorMode> {
  selector?: string;
  attribute?: string;
  initialValue?: T | BasicColorSchema;
  modes?: Partial<Record<T | BasicColorSchema, string>>;
  onChanged?: (mode: T | BasicColorMode, defaultHandler: (mode: T | BasicColorMode) => void) => void;
  storageKey?: string | null;
  storageSync?: boolean;
  disableTransition?: boolean;
  injector?: Injector;
}
```

### Types

```ts
type BasicColorMode = 'light' | 'dark';
type BasicColorSchema = BasicColorMode | 'auto';
```

## Notes

- The function must be called within an injection context
- Changes are automatically synced across browser tabs (unless `storageSync: false`)
- System preference is detected using `window.matchMedia('(prefers-color-scheme: dark)')`
- Transitions are automatically disabled during mode changes to prevent visual glitches
- The `auto` mode dynamically follows system preference changes
