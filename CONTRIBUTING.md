# Contributing to ngxtension

Thank you for considering contributing to ngxtension! We welcome your contributions to help make this Angular utilities library even better. Please take a moment to review this guide before getting started.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [How to Contribute](#how-to-contribute)
   - [Reporting Bugs](#reporting-bugs)
   - [Suggesting Enhancements](#suggesting-enhancements)
   - [Contributing Code](#contributing-code)
3. [Development Setup](#development-setup)
4. [Pull Request Guidelines](#pull-request-guidelines)
5. [Community](#community)
6. [License](#license)

## Code of Conduct

Before we start, please note that this project and its contributors are expected to follow the [Angular Community Code of Conduct](https://github.com/angular/code-of-conduct/blob/main/CODE_OF_CONDUCT.md). Please be respectful and considerate when interacting with other contributors.

## How to Contribute

### Reporting Bugs

If you come across any issues or unexpected behavior, please help us by [creating a new issue](https://github.com/nartc/ngxtension-platform/issues/new) on the GitHub issue tracker. When reporting a bug, please include as much detail as possible, including:

- A clear and descriptive title.
- A detailed description of the problem.
- Steps to reproduce the issue.

### Suggesting Enhancements

If you have an idea for an enhancement or a new feature, please feel free to [create an issue](https://github.com/nartc/ngxtension-platform/issues/new) to discuss it with the community. When suggesting enhancements, provide:

- A clear and descriptive title.
- A detailed explanation of the proposed feature or enhancement.

### Contributing Code

To contribute code to ngxtension, follow these steps:

1. Fork the repository on GitHub.
2. Clone your fork locally: `git clone https://github.com/yourusername/ngxtension-platform.git`
3. Create a new branch for your changes: `git checkout -b feature/your-feature-name`
4. Make your changes and commit them with descriptive commit messages.
5. Push your changes to your fork: `git push origin feature/your-feature-name`
6. Create a pull request (PR) from your branch to the `main` branch of the `ngxtension-platform` repository on GitHub.
7. Commit your changes following the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) convention.
8. Provide a clear title and description for your PR, explaining the purpose and scope of your changes.

We will review your PR as soon as possible, and your contribution will be greatly appreciated!

#### Secondary Entry Point

Most likely, you'll need to create new secondary entry point to put the new utility in. To create entry point, use the following command:

```shell
pnpm exec nx g local-plugin:entry-point <name-of-your-utility> --library=ngxtension --skip-module
```

#### Please write some Tests

Try to cover your new contrib with some tests and make it pass running:

```shell
pnpm exec nx run ngxtension/<name-of-your-utility>:test
```

## Development Setup

If you want to work on ngxtension locally or run tests, follow these steps:

1. Clone the repository: `git clone https://github.com/nartc/ngxtension-platform.git`
2. Navigate to the project folder: `cd ngxtension-platform`
3. Install dependencies: `pnpm install`
4. Make your changes and run tests if applicable.

## Community

Join our community to discuss ideas, ask questions, or get help with any issues you encounter:

- GitHub Discussions: [ngxtension Discussions](https://github.com/nartc/ngxtension-platform/discussions)

## License

By contributing to ngxtension, you agree that your contributions will be licensed under the [MIT License](LICENSE).
