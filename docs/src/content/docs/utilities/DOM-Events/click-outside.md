---
title: clickOutside
description: An Angular directive that emits when the user clicks anywhere outside the element it is on.
entryPoint: ngxtension/click-outside
badge: stable
contributors: ['dale-nguyen']
sidebar:
  order: 20
---

`clickOutside` tells you when the user clicks anywhere outside an element. Use it to close dropdowns, popovers and
menus without writing your own document click listener.

The directive class is exported as `ClickOutside` (that's what you import), while its selector and output are both
named `clickOutside` (that's what you write in the template).

## Usage

Import `ClickOutside` and listen to the `(clickOutside)` output on the element.

```angular-ts
import { Component, signal } from '@angular/core';
import { ClickOutside } from 'ngxtension/click-outside';

@Component({
	selector: 'app-dropdown',
	imports: [ClickOutside],
	template: `
		<div class="dropdown" (clickOutside)="open.set(false)">
			<button type="button" (click)="open.set(!open())">Menu</button>

			@if (open()) {
				<ul class="dropdown-menu">
					<li>Profile</li>
					<li>Sign out</li>
				</ul>
			}
		</div>
	`,
})
export class Dropdown {
	readonly open = signal(false);
}
```

Clicking anywhere outside `.dropdown` closes the menu. Clicks on the element itself or on any of its descendants don't
count as outside.

:::tip[Wrap the trigger too]
Put `clickOutside` on an element that contains both the toggle button and the panel, as in the example above. If you
put it on the panel only, a click on the toggle button counts as an outside click.
:::

## Using the event

The output emits the original click `Event`, so you can inspect what was clicked.

```angular-ts
import { Component } from '@angular/core';
import { ClickOutside } from 'ngxtension/click-outside';

@Component({
	selector: 'app-panel',
	imports: [ClickOutside],
	template: `
		<section (clickOutside)="onOutside($event)">…</section>
	`,
})
export class Panel {
	onOutside(event: Event) {
		console.log('Clicked outside on', event.target);
	}
}
```

## How it works

- One `click` listener on the document is shared by every `clickOutside` in the app. It runs outside the Angular zone,
  so clicks that don't concern any element don't trigger change detection.
- For each click, the directive checks whether `event.target` is inside its host element. If it isn't, it emits
  `clickOutside` inside the Angular zone.
- The subscription is cleaned up when the element is destroyed.

## API

```ts
import { ClickOutside } from 'ngxtension/click-outside';
```

| Name           | Kind      | Type    | Description                                              |
| -------------- | --------- | ------- | -------------------------------------------------------- |
| `ClickOutside` | Directive | -       | Standalone directive with the selector `[clickOutside]`. |
| `clickOutside` | Output    | `Event` | Emits the click event when a click lands outside.        |
