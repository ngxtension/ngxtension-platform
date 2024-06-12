import {
	HtmlParser,
	ParseTreeResult,
	RecursiveVisitor,
	Text,
	visitAll,
} from '@angular-eslint/bundled-angular-compiler';
import { Element as Element_2 } from '@angular/compiler';
import {
	Tree,
	formatFiles,
	getProjects,
	joinPathFragments,
	logger,
	readJson,
	readProjectConfiguration,
	visitNotIgnoredFiles,
} from '@nx/devkit';
import { readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { exit } from 'node:process';
import { Node, SyntaxKind } from 'ts-morph';
import { ContentsStore } from '../shared-utils/contents-store';
import { ConvertToSelfClosingTagGeneratorSchema } from './schema';

function trackContents(
	tree: Tree,
	contentsStore: ContentsStore,
	fullPath: string,
) {
	if (fullPath.endsWith('.ts')) {
		const fileContent =
			tree.read(fullPath, 'utf8') || readFileSync(fullPath, 'utf8');
		if (!fileContent.includes('@Component')) return;
		if (
			fileContent.includes('template') ||
			fileContent.includes('templateUrl')
		) {
			contentsStore.track(fullPath, fileContent);
		}
	}
}

export async function convertToSelfClosingTagGenerator(
	tree: Tree,
	options: ConvertToSelfClosingTagGeneratorSchema,
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

	const { path, project } = options;

	if (path && project) {
		logger.error(
			`[ngxtension] Cannot pass both "path" and "project" to convertToSelfClosingTagGenerator`,
		);
		return exit(1);
	}

	if (path) {
		if (!tree.exists(path)) {
			logger.error(`[ngxtension] "${path}" does not exist`);
			return exit(1);
		}

		trackContents(tree, contentsStore, path);
	} else if (project) {
		try {
			const projectConfiguration = readProjectConfiguration(tree, project);

			if (!projectConfiguration) {
				throw `"${project}" project not found`;
			}

			visitNotIgnoredFiles(tree, projectConfiguration.root, (path) => {
				trackContents(tree, contentsStore, path);
			});
		} catch (err) {
			logger.error(`[ngxtension] ${err}`);
			return;
		}
	} else {
		const projects = getProjects(tree);
		for (const project of projects.values()) {
			visitNotIgnoredFiles(tree, project.root, (path) => {
				trackContents(tree, contentsStore, path);
			});
		}
	}

	for (const { path: sourcePath } of contentsStore.collection) {
		const sourceFile = contentsStore.project.getSourceFile(sourcePath)!;

		const classes = sourceFile.getClasses();

		for (const targetClass of classes) {
			const applicableDecorator = targetClass.getDecorator((decoratorDecl) => {
				return ['Component'].includes(decoratorDecl.getName());
			});
			if (!applicableDecorator) continue;

			// process decorator metadata references
			const decoratorArg = applicableDecorator.getArguments()[0];
			if (Node.isObjectLiteralExpression(decoratorArg)) {
				decoratorArg
					.getChildrenOfKind(SyntaxKind.PropertyAssignment)
					.forEach((property) => {
						const decoratorPropertyName = property.getName();

						if (decoratorPropertyName === 'template') {
							let originalText = property.getFullText();
							originalText = migrateComponentToSelfClosingTags(originalText);

							if (originalText !== property.getFullText()) {
								property.replaceWithText(originalText.trimStart());
							}
						} else if (decoratorPropertyName === 'templateUrl') {
							const dir = dirname(sourcePath);
							const templatePath = joinPathFragments(
								dir,
								property
									.getInitializer()
									.getText()
									.slice(1, property.getInitializer().getText().length - 1),
							);
							let templateText = tree.exists(templatePath)
								? tree.read(templatePath, 'utf8')
								: '';

							if (templateText) {
								templateText = migrateComponentToSelfClosingTags(templateText);
								tree.write(templatePath, templateText);
							}
						}
					});
			}
		}

		tree.write(sourcePath, sourceFile.getFullText());
	}

	if (contentsStore.withTransforms.size) {
		logger.info(
			`
[ngxtension] The following classes have had some Inputs with "transform" converted. Please double check the type arguments on the "transform" Inputs
`,
		);
		contentsStore.withTransforms.forEach((className) => {
			logger.info(`- ${className}`);
		});
	}

	await formatFiles(tree);

	logger.info(
		`
[ngxtension] Conversion completed. Please check the content and run your formatter as needed.
`,
	);
}

export function migrateComponentToSelfClosingTags(template: string): string {
	const parsedTemplate: ParseTreeResult = new HtmlParser().parse(
		template,
		'template.html',
		{ tokenizeBlocks: true },
	);

	const visitor = new ElementCollector();
	visitAll(visitor, parsedTemplate.rootNodes);

	let changedOffset = 0;
	visitor.elements.forEach((element) => {
		const { start, end, tagName } = element;

		const currentLength = template.length;
		const templatePart = template.slice(
			start + changedOffset,
			end + changedOffset,
		);

		function replaceWithSelfClosingTag(html, tagName) {
			const pattern = new RegExp(
				`<\\s*${tagName}\\s*([^>]*?(?:"[^"]*"|'[^']*'|[^'">])*)\\s*>([\\s\\S]*?)<\\s*/\\s*${tagName}\\s*>`,
				'gi',
			);
			const replacement = `<${tagName} $1 />`;
			return html.replace(pattern, replacement);
		}

		const convertedTemplate = replaceWithSelfClosingTag(templatePart, tagName);

		// if the template has changed, replace the original template with the new one
		if (convertedTemplate.length !== templatePart.length) {
			template = replaceTemplate(
				template,
				convertedTemplate,
				start,
				end,
				changedOffset,
			);

			changedOffset += template.length - currentLength;
		}
	});

	return template;
}

class ElementCollector extends RecursiveVisitor {
	readonly elements: ElementToMigrate[] = [];

	constructor() {
		super();
	}

	override visitElement(element: Element_2, context: any) {
		if (element.children.length) {
			if (element.children.length === 1) {
				const child = element.children[0];

				if (child instanceof Text) {
					if (child.value.trim() === '' || child.value.trim() === '\n') {
						if (element.name.includes('-')) {
							this.elements.push({
								tagName: element.name,
								start: element.sourceSpan.start.offset,
								end: element.sourceSpan.end.offset,
							});
						}
					}
				}
			}

			return super.visitElement(element, context);
		}

		if (element.name.includes('-')) {
			this.elements.push({
				tagName: element.name,
				start: element.sourceSpan.start.offset,
				end: element.sourceSpan.end.offset,
			});
		}
		return super.visitElement(element, context);
	}
}

/**
 * Replace the value in the template with the new value based on the start and end position + offset
 */
function replaceTemplate(
	template: string,
	replaceValue: string,
	start: number,
	end: number,
	offset: number,
) {
	return (
		template.slice(0, start + offset) +
		replaceValue +
		template.slice(end + offset)
	);
}

export interface ElementToMigrate {
	tagName: string;
	start: number;
	end: number;
}

export default convertToSelfClosingTagGenerator;
