# ngxtension - Angular Extensions

[![NPM Version](https://img.shields.io/npm/v/ngxtension?style=flat-square)](https://npmjs.org/package/ngxtension)
[![NPM Downloads](https://img.shields.io/npm/dw/ngxtension?logo=npm&style=flat-square)](https://npmjs.org/package/ngxtension)
[![All Contributors](https://img.shields.io/badge/all_contributors-50-orange.svg?style=flat-square)](#contributors-)

> A modern collection of utilities for [Angular](https://angular.dev) – signals, forms, effects, DOM helpers, and more.

---

## ✨ Features

- **Signal Utilities**: Advanced computed, derived, and async signals, signal history, lazy signals, and more.
- **DOM & Event Helpers**: Click outside, gestures, resize observer, active element, host binding, and more.
- **Forms**: Control value accessor helpers, control error, form events, if-validator, etc.
- **RxJS & Effects**: Auto effects, explicit effects, create effect, rx-effect, take-latest-from, etc.
- **Injection & DI**: Create injectable, create injection token, assert injector, inject-destroy, inject-lazy, inject-network, and more.
- **Array & Object Utilities**: Filter array, map array, reduce array, merge-from, not-pattern, etc.
- **Routing**: Inject params, inject query params, inject route data/fragment, navigation-end, linked-query-param.
- **Internationalization**: Utilities for i18n and formatting.
- **SVG & UI**: SVG sprite helpers, repeat pipe, trackBy helpers, and more.

> **See the [full documentation](https://ngxtension.netlify.app/) for a complete list and usage examples.**

---

## 🚀 Installation

```bash
npm install ngxtension
# or with pnpm
pnpm add ngxtension
```

### For Angular CLI or Nx workspaces

After installing, run the init schematic:

```bash
ng generate ngxtension-plugin:init
# or with Nx
nx generate ngxtension-plugin:init
```

---

## 📦 Usage

Import the utilities you need:

```ts
import { linkedQueryParam } from 'ngxtension/linked-query-param';
import { injectParams } from 'ngxtension/inject-params';
```

All utilities are tree-shakable and designed for Angular 16+.

---

## 📚 Documentation

- **Full API & Guides:** [ngxtension.netlify.app](https://ngxtension.netlify.app/)
- **Changelog:** [CHANGELOG.md](https://github.com/ngxtension/ngxtension-platform/blob/main/CHANGELOG.md)

---

## 🤝 Contributors

Thanks to all these amazing people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

[![All Contributors](https://img.shields.io/badge/all_contributors-50-orange.svg?style=flat-square)](https://github.com/ngxtension/ngxtension-platform/blob/main/README.md#contributors-)

Want to contribute? Read our [contributing guide](https://github.com/ngxtension/ngxtension-platform/blob/main/CONTRIBUTING.md) and join us!

---

## 📄 License

MIT

---

**Ready to supercharge your Angular app? [Get started with ngxtension!](https://ngxtension.netlify.app/)**
