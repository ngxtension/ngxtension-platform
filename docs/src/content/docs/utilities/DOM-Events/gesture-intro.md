---
title: Gestures
description: Overview of ngxtension/gestures, Angular bindings for drag, move, hover, scroll, wheel and pinch gestures built on @use-gesture.
badge: stable
contributors: ['chau-tran']
sidebar:
  order: 30
---

`ngxtension/gestures` lets you react to mouse and touch gestures (drag, move, hover, scroll, wheel and pinch) on any
element. Each gesture gives you rich state on every frame (position, offset, velocity, direction and more), so you can
build sliders, swipe-to-dismiss cards, zoomable images or custom drag interactions. It wraps
[`@use-gesture/vanilla`](https://use-gesture.netlify.app/), which you install alongside ngxtension.

```bash
npm i @use-gesture/vanilla
```

## Available gestures

Every gesture comes in two forms: a directive you put in a template, and an `inject*` function you call inside a
component or directive to bind the gesture to its host element.

| Gesture | Directive and output       | Function       | State type                 |
| ------- | -------------------------- | -------------- | -------------------------- |
| Drag    | `NgxDrag`, `(ngxDrag)`     | `injectDrag`   | `NgxInjectDrag['state']`   |
| Move    | `NgxMove`, `(ngxMove)`     | `injectMove`   | `NgxInjectMove['state']`   |
| Hover   | `NgxHover`, `(ngxHover)`   | `injectHover`  | `NgxInjectHover['state']`  |
| Scroll  | `NgxScroll`, `(ngxScroll)` | `injectScroll` | `NgxInjectScroll['state']` |
| Wheel   | `NgxWheel`, `(ngxWheel)`   | `injectWheel`  | `NgxInjectWheel['state']`  |
| Pinch   | `NgxPinch`, `(ngxPinch)`   | `injectPinch`  | `NgxInjectPinch['state']`  |

Combining several gestures in one handler (use-gesture's multi-gesture `Gesture` class) isn't supported yet. You can
still put several directives on the same element.

Read [Gesture](/utilities/dom-events/gesture/) next for usage examples, configuration and zone handling. The examples
there use drag, and the same API applies to every gesture above.

## Gestures or the Angular CDK?

The [Angular CDK](https://material.angular.io/cdk/categories) ships complete features such as
[Drag and Drop](https://material.angular.io/cdk/drag-drop/overview) (sortable lists, drop zones) and
[Scrolling](https://material.angular.io/cdk/scrolling/overview) (virtual scroll).

`ngxtension/gestures` works at a lower level: it only captures the gesture and hands you its data. You decide what
happens with it, which makes it a good fit for custom interactions and for driving animation libraries such as
[GSAP](https://gsap.com/).

If you need sortable lists, drop zones or virtual scrolling, use the Angular CDK.
