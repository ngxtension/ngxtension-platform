---
title: SFC components migration
description: A generator that inlines component templateUrl files (and optionally styles) into single-file components.
entryPoint: plugin/src/generators/convert-to-sfc
badge: stable
contributors: ['enea-jahollari']
---

A single-file component (SFC) keeps its template, and often its styles, inline in the `.ts` file instead of in separate `.html` and `.css` files. The `convert-to-sfc` generator from `ngxtension-plugin` moves `templateUrl` files into `template`, and can do the same for `styleUrl` / `styleUrls`. Large templates and styles are skipped, so only small components change.

## Usage

Install the plugin if you don't have it yet:

```shell
npm install -D ngxtension-plugin
```

Then run the generator. Without options it converts the components of every project in the workspace:

```shell
ng g ngxtension-plugin:convert-to-sfc
```

In an Nx workspace, use `nx` instead of `ng`:

```shell
nx g ngxtension-plugin:convert-to-sfc
```

Limit it to one project or one file:

```shell
ng g ngxtension-plugin:convert-to-sfc --project=my-app
ng g ngxtension-plugin:convert-to-sfc --path=src/app/card/card.component.ts
```

Commit or stash your work first, so you can review the changes with `git diff`.

## What it changes

Before, `card.component.ts` with a separate `card.component.html`:

```ts
@Component({
	selector: 'app-card',
	templateUrl: './card.component.html',
	styleUrl: './card.component.css',
})
export class CardComponent {}
```

After running with `--move-styles`, both files are deleted and their contents are inlined:

```ts
@Component({
	selector: 'app-card',
	template: `
		<div class="card"><ng-content /></div>
	`,
	styles: `
		.card {
			padding: 1rem;
		}
	`,
})
export class CardComponent {}
```

- Only `@Component` classes with a `templateUrl` are converted.
- Templates longer than `--max-inline-template-lines` (200 by default) are left alone.
- Templates that contain `${` are skipped, because they would break the template literal.
- Styles are only moved with `--move-styles`, and only when they're no longer than `--max-inline-style-lines` (200 by default).
- The file contents are pasted as they are. The generator formats changed files with Prettier if your workspace has it, but Prettier doesn't re-indent template literals.

## Move styles and change the limits

```shell
ng g ngxtension-plugin:convert-to-sfc --move-styles
ng g ngxtension-plugin:convert-to-sfc --move-styles --max-inline-template-lines=100 --max-inline-style-lines=50
```

:::caution
Check the diff before you commit:

- `--move-styles` handles one stylesheet per component (`styleUrl`, or `styleUrls` with a single entry). A component with several files in `styleUrls` ends up with empty `styles`, so leave `--move-styles` off for it, or convert it with `--path` and fix the styles by hand.
- The template is pasted into a template literal as-is. A template that contains a backtick (`` ` ``) needs to be escaped by hand.
  :::

## Options

| Option                        | Type      | Default | Description                                                                  |
| ----------------------------- | --------- | ------- | ---------------------------------------------------------------------------- |
| `--project`                   | `string`  | –       | Only convert components in this project. Aliases: `--name`, `--projectName`. |
| `--path`                      | `string`  | –       | Only convert this file, relative to the workspace root.                      |
| `--move-styles`               | `boolean` | `false` | Also inline `styleUrl` / `styleUrls` into `styles`.                          |
| `--max-inline-template-lines` | `number`  | `200`   | Skip templates with more lines than this.                                    |
| `--max-inline-style-lines`    | `number`  | `200`   | Skip stylesheets with more lines than this.                                  |

Pass either `--project` or `--path`, not both. With neither, every project in the workspace is converted.

## Related

- [Host Binding Migration](/utilities/migrations/host-binding-migration/), the other generator in `ngxtension-plugin`.
