# ngxtension/inject-media-query

Secondary entry point of `ngxtension`. It can be used by importing from `ngxtension/inject-media-query`.

## Overview

Reactive Media Query using `window.matchMedia`. This utility provides a simple way to track media query matches using Angular signals. Once you've created a media query, you can check the result and receive reactive notifications when the result changes.

## Usage

### Basic Usage

```ts
import { Component, effect } from '@angular/core';
import { injectMediaQuery } from 'ngxtension/inject-media-query';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <div [class.large]="isLargeScreen()">
      <p>Screen is {{ isLargeScreen() ? 'large' : 'small' }}</p>
      <p>Theme: {{ isPreferredDark() ? 'dark' : 'light' }}</p>
    </div>
  `,
})
export class AppComponent {
  isLargeScreen = injectMediaQuery('(min-width: 1024px)');
  isPreferredDark = injectMediaQuery('(prefers-color-scheme: dark)');

  constructor() {
    effect(() => {
      console.log('Large screen:', this.isLargeScreen());
      console.log('Prefers dark:', this.isPreferredDark());
    });
  }
}
```

### Dynamic Media Queries

You can use signals to dynamically change the media query:

```ts
import { Component, signal } from '@angular/core';
import { injectMediaQuery } from 'ngxtension/inject-media-query';

@Component({
  selector: 'app-responsive',
  standalone: true,
  template: `
    <div>
      <button (click)="toggleBreakpoint()">Toggle Breakpoint</button>
      <p>Matches: {{ matches() }}</p>
    </div>
  `,
})
export class ResponsiveComponent {
  breakpoint = signal('(min-width: 768px)');
  matches = injectMediaQuery(this.breakpoint);

  toggleBreakpoint() {
    const current = this.breakpoint();
    this.breakpoint.set(
      current === '(min-width: 768px)'
        ? '(min-width: 1024px)'
        : '(min-width: 768px)'
    );
  }
}
```

### Common Media Queries

```ts
@Component({
  selector: 'app-media-queries',
  standalone: true,
  template: `...`,
})
export class MediaQueriesComponent {
  // Screen sizes
  isMobile = injectMediaQuery('(max-width: 767px)');
  isTablet = injectMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  isDesktop = injectMediaQuery('(min-width: 1024px)');

  // Orientation
  isPortrait = injectMediaQuery('(orientation: portrait)');
  isLandscape = injectMediaQuery('(orientation: landscape)');

  // Color scheme preference
  prefersDark = injectMediaQuery('(prefers-color-scheme: dark)');
  prefersLight = injectMediaQuery('(prefers-color-scheme: light)');

  // Reduced motion preference
  prefersReducedMotion = injectMediaQuery('(prefers-reduced-motion: reduce)');

  // Hover capability
  canHover = injectMediaQuery('(hover: hover)');

  // Print media
  isPrint = injectMediaQuery('print');
}
```

### Responsive Component

Build responsive components that adapt to screen size:

```ts
import { Component, computed } from '@angular/core';
import { injectMediaQuery } from 'ngxtension/inject-media-query';

@Component({
  selector: 'app-gallery',
  standalone: true,
  template: `
    <div [attr.data-columns]="columns()">
      <div *ngFor="let item of items">{{ item }}</div>
    </div>
  `,
  styles: [
    `
      [data-columns='1'] { grid-template-columns: 1fr; }
      [data-columns='2'] { grid-template-columns: repeat(2, 1fr); }
      [data-columns='3'] { grid-template-columns: repeat(3, 1fr); }
      [data-columns='4'] { grid-template-columns: repeat(4, 1fr); }
    `,
  ],
})
export class GalleryComponent {
  isMobile = injectMediaQuery('(max-width: 767px)');
  isTablet = injectMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  isDesktop = injectMediaQuery('(min-width: 1024px)');
  isLargeDesktop = injectMediaQuery('(min-width: 1440px)');

  columns = computed(() => {
    if (this.isLargeDesktop()) return 4;
    if (this.isDesktop()) return 3;
    if (this.isTablet()) return 2;
    return 1;
  });

  items = Array.from({ length: 12 }, (_, i) => `Item ${i + 1}`);
}
```

### Dark Mode Support

```ts
import { Component, effect } from '@angular/core';
import { injectMediaQuery } from 'ngxtension/inject-media-query';

@Component({
  selector: 'app-theme',
  standalone: true,
  template: `
    <div [class.dark-mode]="prefersDark()">
      <h1>Auto Dark Mode</h1>
      <p>This component automatically adapts to system theme preference</p>
    </div>
  `,
})
export class ThemeComponent {
  prefersDark = injectMediaQuery('(prefers-color-scheme: dark)');

  constructor() {
    effect(() => {
      document.documentElement.classList.toggle('dark', this.prefersDark());
    });
  }
}
```

### Conditional Rendering

```ts
import { Component } from '@angular/core';
import { injectMediaQuery } from 'ngxtension/inject-media-query';

@Component({
  selector: 'app-navigation',
  standalone: true,
  template: `
    @if (isDesktop()) {
      <nav class="desktop-nav">
        <a>Home</a>
        <a>About</a>
        <a>Contact</a>
      </nav>
    } @else {
      <button (click)="toggleMenu()">Menu</button>
    }
  `,
})
export class NavigationComponent {
  isDesktop = injectMediaQuery('(min-width: 768px)');

  toggleMenu() {
    // Mobile menu logic
  }
}
```

### Custom Window

For SSR or testing, you can provide a custom window object:

```ts
@Component({
  selector: 'app-custom-window',
  standalone: true,
  template: `...`,
})
export class CustomWindowComponent {
  customWindow = {
    matchMedia: (query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
  } as unknown as Window;

  matches = injectMediaQuery('(min-width: 1024px)', {
    window: this.customWindow,
  });
}
```

## API

### Options

```ts
interface InjectMediaQueryOptions {
  /**
   * Custom injector for dependency injection
   */
  injector?: Injector;

  /**
   * Custom window object (useful for SSR/testing)
   */
  window?: Window;
}
```

### Return Value

Returns a **readonly** `Signal<boolean>` that:
- Emits `true` when the media query matches
- Emits `false` when the media query doesn't match
- Automatically updates when the media query state changes
- Returns `false` if `matchMedia` is not supported

## Browser Compatibility

- All modern browsers support `window.matchMedia`
- IE 10+ (with partial support)
- For older browsers, the function will return `false`

## SSR Considerations

When using server-side rendering, the `window` object is not available. The function will safely return `false` in such environments. You can provide a custom window object via options if you need specific behavior during SSR.

## Credits

Ported from [VueUse useMediaQuery](https://vueuse.org/core/useMediaQuery/)
