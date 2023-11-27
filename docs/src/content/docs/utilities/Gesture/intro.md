---
title: 'Introduction'
description: 'ngxtension/gestures'
badge: stable
contributor: chau-tran
sidebar:
  order: 1
---

`ngxtension/gestures` is a collection of Gestures that let you bind mouse and touch events.

- [x] Drag
- [x] Move
- [x] Hover
- [x] Scroll
- [x] Wheel
- [x] Pinch
- [ ] Multiple gestures

### Comparison to Angular CDK

[Angular CDK](https://cdk.angular.io) offers features like [Drag & Drop](https://material.angular.io/cdk/drag-drop/overview) and [Scrolling](https://material.angular.io/cdk/scrolling/overview),
while `ngxtension/gestures` specializes in capturing gestures on elements exclusively. In essence, `ngxtension/gestures` operates at a more granular, low-level perspective compared to Angular CDK.
Its fine-grained control over Gesture data empowers you to craft a broader range of interactions and facilitates seamless integration with animation libraries such as [GSAP](https://greensock.com/gsap/).

For specific Drag & Drop / Virtual Scroll features, we still recommend going with the Angular CDK.
