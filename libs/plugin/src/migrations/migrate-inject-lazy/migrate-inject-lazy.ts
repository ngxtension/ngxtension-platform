import {
	formatFiles,
	getProjects,
	logger,
	visitNotIgnoredFiles,
	type Tree,
} from '@nx/devkit';
import { Project, SyntaxKind } from 'ts-morph';

const SOURCE_MODULE = 'ngxtension/inject-lazy';
const TARGET_MODULE = '@angular/core';
const OLD_FN = 'injectLazy';
const NEW_FN = 'injectAsync';

export default async function update(host: Tree): Promise<void> {
	const projects = getProjects(host);
	const filesWithRemovedInjector: string[] = [];

	for (const [, projectConfig] of projects.entries()) {
		visitNotIgnoredFiles(host, projectConfig.root, (path) => {
			if (!path.endsWith('.ts')) return;

			const content = host.read(path, 'utf8');
			if (!content?.includes(OLD_FN)) return;

			const project = new Project({ useInMemoryFileSystem: true });
			const sourceFile = project.createSourceFile(path, content, {
				overwrite: true,
			});

			// Locate the injectLazy named import from ngxtension/inject-lazy
			const sourceImport = sourceFile.getImportDeclaration(
				(d) => d.getModuleSpecifierValue() === SOURCE_MODULE,
			);
			if (!sourceImport) return;

			const injectLazySpecifier = sourceImport
				.getNamedImports()
				.find((n) => n.getName() === OLD_FN);
			if (!injectLazySpecifier) return;

			// 1. Remove injectLazy from the source import.
			//    If it was the only named import, remove the whole declaration.
			if (sourceImport.getNamedImports().length === 1) {
				sourceImport.remove();
			} else {
				injectLazySpecifier.remove();
			}

			// 2. Add injectAsync to @angular/core, merging into an existing import if present.
			const coreImport = sourceFile.getImportDeclaration(
				(d) => d.getModuleSpecifierValue() === TARGET_MODULE,
			);
			if (coreImport) {
				if (!coreImport.getNamedImports().find((n) => n.getName() === NEW_FN)) {
					coreImport.addNamedImport(NEW_FN);
				}
			} else {
				sourceFile.addImportDeclaration({
					namedImports: [NEW_FN],
					moduleSpecifier: TARGET_MODULE,
				});
			}

			// 3. Migrate all injectLazy(…) call expressions.
			//    Reverse to avoid position shifts when removing arguments.
			const calls = [
				...sourceFile
					.getDescendantsOfKind(SyntaxKind.CallExpression)
					.filter((call) => call.getExpression().getText() === OLD_FN),
			].reverse();

			for (const call of calls) {
				const args = call.getArguments();

				if (args.length >= 2) {
					// injectAsync captures the injector from the injection context
					// automatically and does not accept an explicit injector argument.
					filesWithRemovedInjector.push(path);
					call.removeArgument(args[1]);
				}

				call.getExpression().replaceWithText(NEW_FN);
			}

			// 4. Rename any remaining identifier references (e.g. standalone type usage).
			[
				...sourceFile
					.getDescendantsOfKind(SyntaxKind.Identifier)
					.filter((id) => id.getText() === OLD_FN),
			]
				.reverse()
				.forEach((id) => id.replaceWithText(NEW_FN));

			const updated = sourceFile.getFullText();
			if (updated !== content) {
				host.write(path, updated);
			}
		});
	}

	if (filesWithRemovedInjector.length > 0) {
		logger.warn(
			`\nThe following files used injectLazy with an explicit injector argument.` +
				`\nThe argument has been removed because injectAsync always captures the` +
				`\ninjector from the current injection context. Review these files:\n` +
				filesWithRemovedInjector.map((f) => `  - ${f}`).join('\n'),
		);
	}

	logger.warn(
		`\n⚠  Manual steps required after this migration:` +
			`\n   • injectAsync returns '() => Promise<T>' instead of 'Observable<T>'.` +
			`\n     Update every call site that consumed the result as an Observable.` +
			`\n   • The default-export shorthand '() => import(...)' is not supported` +
			`\n     by injectAsync. Use '() => import(...).then(m => m.MyService)' instead.` +
			`\n   • mockLazyProvider is no longer needed; use standard TestBed providers.` +
			`\n   See: https://github.com/angular/angular/pull/68248`,
	);

	await formatFiles(host);
}
