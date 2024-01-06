---
title: Introduction
description: What is ngxtension?
sidebar:
  order: 1
---

`ngxtension` is a utilities library for [Angular](https://angular.io). It consists of a variety of utilities that make Angular development easier and more consistent.

The project is kick-started by [Chau](https://github.com/nartc) along with [Enea](https://twitter.com/Enea_Jahollari) and it is fully [open-sourced](https://github.com/nartc/ngxtension-platform). We welcome contributions of all kinds. If you have an issue or idea, please [let us know](https://github.com/nartc/ngxtension-platform/issues/new)
Find yourself adding something over and over again to every Angular projects? That is something we want to have in `ngxtension`. We intend for `ngxtension` to be "_anything goes_" but with careful consideration as well as up-to-standard Angular code so that `ngxtension` can become a one-stop shop for every Angular developer out there.

## Bundle-size Consideration

The library is entirely consisted of [Secondary Entry Point](https://angular.io/guide/angular-package-format#entrypoints-and-code-splitting). Even though we ship `ngxtension` as one package (so it is easy for consumers to install), Angular build pipeline should handle code-splitting and tree-shaking properly for all the entry points that `ngxtension` comes with.

The GZIP size badge (if available) is provided by [bundlejs](https://bundlejs.dev/) and it is shown as the bundled size of the entry point and all of its `ngxtension` dependencies. For example, `ngxtension/connect` depends on `ngxtension/assert-injector` so the GZIP size badge of `ngxtension/connect` will be the bundled size of `ngxtension/connect` and `ngxtension/assert-injector`.
