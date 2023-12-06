---
title: 'Introducción'
description: 'ngxtension/gestures'
badge: stable
contributor: chau-tran
sidebar:
  order: 1
---

`ngxtension/gestures` es una colección que te permite vincular (bind) a eventos de mouse y touch.

- [x] Drag
- [x] Move
- [x] Hover
- [x] Scroll
- [x] Wheel
- [x] Pinch
- [ ] Multiple gestures

### Comparación al Angular CDK

[Angular CDK](https://cdk.angular.io) ofrece características como [Drag and Drop](https://material.angular.io/cdk/drag-drop/overview) y [Scrolling](https://material.angular.io/cdk/scrolling/overview),
mientras que `ngxtension/gestures` se especializa en capturar gestos exclusivamente en elementos. En esencia, `ngxtension/gestures` opera desde una perspectiva más granular y de bajo nivel en comparación con Angular CDK.
Su control detallado sobre los datos de los gestos te permite crear una amplia gama de interacciones y facilita la integración perfecta con bibliotecas de animación como [GSAP](https://greensock.com/gsap/).

Para características específicas de arrastrar y soltar / desplazamiento virtual, todavía recomendamos utilizar Angular CDK.
