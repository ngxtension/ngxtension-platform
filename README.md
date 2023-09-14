# NG Extension Platform

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

A collection of utilities for [Angular](https://angular.io).

## Installation

The `ng-add` schematic/generator installs the `ngxtension` package as well as turning on `skipLibCheck` TypeScript configuration if it hasn't been turned on.
This allows your project to skip checking types for external libraries like `ngxtension` where typings might not be compatible with your project's strictness.

```shell
ng add ngxtension
```

or

```shell
npm install ngxtension
```

```shell
yarn add ngxtension
```

```shell
pnpm install ngxtension
```

```shell
nx generate ngxtension:init
```

## Utilities

<!-- UTILITIES:START -->

| name                     | link                                                         |
| ------------------------ | ------------------------------------------------------------ |
| `resize`                 | [README](./libs/ngxtension/resize/README.md)                 |
| `create-injection-token` | [README](./libs/ngxtension/create-injection-token/README.md) |
| `assert-injector`        | [README](./libs/ngxtension/assert-injector/README.md)        |
| `repeat`                 | [README](./libs/ngxtension/repeat/README.md)                 |
| `computed-from`          | [README](./libs/ngxtension/computed-from/README.md)          |
| `inject-destroy`         | [README](./libs/ngxtension/inject-destroy/README.md)         |
| `connect`                | [README](./libs/ngxtension/connect/README.md)                |
| `createEffect`           | [README](./libs/ngxtension/create-effect/README.md)          |

<!-- UTILITIES:END -->

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://nartc.me/"><img src="https://avatars.githubusercontent.com/u/25516557?v=4?s=100" width="100px;" alt="Chau Tran"/><br /><sub><b>Chau Tran</b></sub></a><br /><a href="https://github.com/nartc/ngxtension-platform/commits?author=nartc" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://eneajaho.me"><img src="https://avatars.githubusercontent.com/u/25394362?v=4?s=100" width="100px;" alt="Enea Jahollari"/><br /><sub><b>Enea Jahollari</b></sub></a><br /><a href="https://github.com/nartc/ngxtension-platform/commits?author=eneajaho" title="Code">💻</a></td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <td align="center" size="13px" colspan="7">
        <img src="https://raw.githubusercontent.com/all-contributors/all-contributors-cli/1b8533af435da9854653492b1327a23a4dbd0a10/assets/logo-small.svg">
          <a href="https://all-contributors.js.org/docs/en/bot/usage">Add your contributions</a>
        </img>
      </td>
    </tr>
  </tfoot>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
