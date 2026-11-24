import {
	formatFiles,
	getProjects,
	joinPathFragments,
	logger,
	readJson,
	readProjectConfiguration,
	Tree,
	visitNotIgnoredFiles,
} from '@nx/devkit';
import { readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { exit } from 'node:process';
import { Expression, Node, SyntaxKind } from 'ts-morph';
import { ContentsStore } from '../shared-utils/contents-store';
import { ConvertToSFCGeneratorSchema } from './schema';

function trackContents(
	tree: Tree,
	contentsStore: ContentsStore,
	fullPath: string,
	moveStyles: boolean,
) {
	if (fullPath.endsWith('.ts')) {
		const fileContent =
			tree.read(fullPath, 'utf8') || readFileSync(fullPath, 'utf8');
		if (!fileContent.includes('@Component')) return;
		if (
			fileContent.includes('templateUrl') ||
			(moveStyles && fileContent.includes('styleUrl'))
		) {
			contentsStore.track(fullPath, fileContent);
		}
	}
}

export async function convertToSFCGenerator(
	tree: Tree,
	options: ConvertToSFCGeneratorSchema,
) {
	const contentsStore = new ContentsStore();
	const packageJson = readJson(tree, 'package.json');
	const angularCorePackage =
		packageJson['dependencies']['@angular/core'] ||
		packageJson['devDependencies']['@angular/core'];

	if (!angularCorePackage) {
		logger.error(`[ngxtension] No @angular/core detected`);
		return exit(1);
	}

	const { path, project, moveStyles } = options;
	let { maxInlineTemplateLines, maxInlineStyleLines } = options;
	maxInlineStyleLines = maxInlineStyleLines || 200;
	maxInlineTemplateLines = maxInlineTemplateLines || 200;

	if (path && project) {
		logger.error(
			`[ngxtension] Cannot pass both "path" and "project" to convertToSFCGenerator`,
		);
		return exit(1);
	}

	if (path) {
		if (!tree.exists(path)) {
			logger.error(`[ngxtension] "${path}" does not exist`);
			return exit(1);
		}

		trackContents(tree, contentsStore, path, moveStyles);
	} else if (project) {
		try {
			const projectConfiguration = readProjectConfiguration(tree, project);

			if (!projectConfiguration) {
				throw `"${project}" project not found`;
			}

			visitNotIgnoredFiles(tree, projectConfiguration.root, (path) => {
				trackContents(tree, contentsStore, path, moveStyles);
			});
		} catch (err) {
			logger.error(`[ngxtension] ${err}`);
			return;
		}
	} else {
		const projects = getProjects(tree);
		for (const project of projects.values()) {
			visitNotIgnoredFiles(tree, project.root, (path) => {
				trackContents(tree, contentsStore, path, moveStyles);
			});
		}
	}

	for (const { path: sourcePath } of contentsStore.collection) {
		if (!sourcePath.endsWith('.ts')) continue;

		const sourceFile = contentsStore.project.getSourceFile(sourcePath)!;

		const classes = sourceFile.getClasses();

		for (const targetClass of classes) {
			const applicableDecorator = targetClass.getDecorator((decoratorDecl) => {
				return ['Component'].includes(decoratorDecl.getName());
			});
			if (!applicableDecorator) continue;

			const decoratorArg = applicableDecorator.getArguments()[0];
			if (Node.isObjectLiteralExpression(decoratorArg)) {
				decoratorArg
					.getChildrenOfKind(SyntaxKind.PropertyAssignment)
					.forEach((property) => {
						const decoratorPropertyName = property.getName();
						if (decoratorPropertyName === 'templateUrl') {
							const templateUrl = getStringLiteral(property.getInitializer());
							if (templateUrl === undefined) {
								logger.warn(
									`[ngxtension] Skipping templateUrl in ${sourcePath}: it is not a string literal`,
								);
								return;
							}

							const templatePath = joinPathFragments(
								dirname(sourcePath),
								templateUrl,
							);
							if (!tree.exists(templatePath)) {
								logger.warn(
									`[ngxtension] Skipping templateUrl in ${sourcePath}: "${templatePath}" does not exist`,
								);
								return;
							}

							const templateText = tree.read(templatePath, 'utf8');
							const templateTextLines = templateText.split('\n').length;

							// if the template is not too long and does not contain any js interpolation
							if (
								!templateText.includes('${') &&
								templateTextLines <= maxInlineTemplateLines
							) {
								try {
									// replace the templateUrl with the template
									property.replaceWithText(
										`template: ${toTemplateLiteral(templateText)}`,
									);

									contentsStore.track(templatePath, templateText);

									// remove the templateUrl file
									tree.delete(templatePath);
								} catch (err) {
									logger.error(
										`[ngxtension] Skipping ${sourcePath} due to error: ${err}`,
									);
								}
							}
						}

						if (
							moveStyles &&
							(decoratorPropertyName === 'styleUrl' ||
								decoratorPropertyName === 'styleUrls')
						) {
							const styleUrls = getStringLiterals(property.getInitializer());
							if (!styleUrls?.length) {
								logger.warn(
									`[ngxtension] Skipping ${decoratorPropertyName} in ${sourcePath}: it is empty or not a string literal (or array of string literals)`,
								);
								return;
							}

							const stylePaths = styleUrls.map((styleUrl) =>
								joinPathFragments(dirname(sourcePath), styleUrl),
							);
							const missingStylePath = stylePaths.find(
								(stylePath) => !tree.exists(stylePath),
							);
							if (missingStylePath) {
								logger.warn(
									`[ngxtension] Skipping ${decoratorPropertyName} in ${sourcePath}: "${missingStylePath}" does not exist`,
								);
								return;
							}

							const styleTexts = stylePaths.map((stylePath) =>
								tree.read(stylePath, 'utf8'),
							);
							const styleTextLines = styleTexts.reduce(
								(lines, styleText) => lines + styleText.split('\n').length,
								0,
							);

							if (styleTextLines <= maxInlineStyleLines) {
								try {
									const styleLiterals = styleTexts.map(toTemplateLiteral);
									// replace the styleUrl(s) with the style(s)
									property.replaceWithText(
										styleLiterals.length === 1
											? `styles: ${styleLiterals[0]}`
											: `styles: [${styleLiterals.join(', ')}]`,
									);

									stylePaths.forEach((stylePath, index) => {
										contentsStore.track(stylePath, styleTexts[index]);
										// remove the styleUrl file
										tree.delete(stylePath);
									});
								} catch (err) {
									logger.error(
										`[ngxtension] Skipping ${sourcePath} due to error: ${err}`,
									);
								}
							}
						}
					});
			}
		}

		tree.write(sourcePath, sourceFile.getFullText());
	}

	await formatFiles(tree);

	logger.info(
		`
[ngxtension] Conversion completed. Please check the content and run your formatter as needed.
`,
	);
}

function getStringLiteral(node: Node | undefined) {
	return Node.isStringLiteral(node) ||
		Node.isNoSubstitutionTemplateLiteral(node)
		? node.getLiteralValue()
		: undefined;
}

/**
 * Returns the values of a string literal, or of an array of string literals.
 * Returns `null` for anything else (variables, function calls, spreads, ...).
 */
function getStringLiterals(initializer: Expression | undefined) {
	const value = getStringLiteral(initializer);
	if (value !== undefined) return [value];

	if (Node.isArrayLiteralExpression(initializer)) {
		const values = initializer.getElements().map(getStringLiteral);
		return values.every((value) => value !== undefined) ? values : null;
	}
	return null;
}

/** Wraps text in a template literal, escaping the characters that would change its meaning. */
function toTemplateLiteral(text: string) {
	const escaped = text
		.replace(/\\/g, '\\\\')
		.replace(/`/g, '\\`')
		.replace(/\$\{/g, '\\${');
	return `\`\n${escaped}\n\``;
}

export default convertToSFCGenerator;
