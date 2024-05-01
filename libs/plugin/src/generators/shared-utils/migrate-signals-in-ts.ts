import { Tree, joinPathFragments } from '@nx/devkit';
import { dirname } from 'node:path';
import { CallExpression, Decorator, Node, SyntaxKind } from 'ts-morph';
import { migrateTemplateVariablesToSignals } from './migrate-signals-in-template';

export function migrateSignalsInClassOrDecorator(
	tree: Tree,
	sourcePath: string,
	targetClass: Node,
	applicableDecorator: Decorator,
	convertedVariables: Map<string, string>,
) {
	if (convertedVariables.size) {
		// process decorator metadata references
		const decoratorArg = applicableDecorator.getArguments()[0];
		if (Node.isObjectLiteralExpression(decoratorArg)) {
			decoratorArg
				.getChildrenOfKind(SyntaxKind.PropertyAssignment)
				.forEach((property) => {
					const decoratorPropertyName = property.getName();

					if (
						decoratorPropertyName === 'host' ||
						decoratorPropertyName === 'template'
					) {
						let originalText = property.getFullText();
						originalText = migrateTemplateVariablesToSignals(
							originalText,
							new Set(convertedVariables.keys()),
						);

						if (originalText !== property.getFullText()) {
							property.replaceWithText(originalText);
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
							templateText = migrateTemplateVariablesToSignals(
								templateText,
								new Set(convertedVariables.keys()),
							);
							tree.write(templatePath, templateText);
						}
					}
				});
		}

		// process ts class references
		const nonNullifyProperties = new Map<string, string>();
		for (const propertyAccessExpression of targetClass.getDescendantsOfKind(
			SyntaxKind.PropertyAccessExpression,
		)) {
			const propertyExpression = propertyAccessExpression.getExpression();
			if (!Node.isThisExpression(propertyExpression)) continue;

			const propertyName = propertyAccessExpression.getName();
			if (!convertedVariables.has(propertyName)) continue;

			const startLineInfo = getStartLineInfo(propertyAccessExpression);

			const ifParent = propertyAccessExpression.getFirstAncestorByKind(
				SyntaxKind.IfStatement,
			);

			const ternaryParent = propertyAccessExpression.getFirstAncestorByKind(
				SyntaxKind.ConditionalExpression,
			);

			if (
				(ifParent &&
					getStartLineInfo(ifParent.getExpression()) === startLineInfo) ||
				(ternaryParent &&
					getStartLineInfo(ternaryParent.getCondition()) === startLineInfo)
			) {
				nonNullifyProperties.set(propertyName, startLineInfo);
			}

			const callExpression = propertyAccessExpression.replaceWithText(
				`${propertyAccessExpression.getText()}()`,
			) as CallExpression;

			// this means that this property has been used in an if/ternary condition above
			if (
				nonNullifyProperties.has(propertyName) &&
				nonNullifyProperties.get(propertyName) !== startLineInfo
			) {
				callExpression.replaceWithText(`${callExpression.getText()}!`);
			}
		}
	}
}

export function getStartLineInfo(node: Node) {
	return `${node.getStartLineNumber()}:${node.getStartLinePos()}:${node.getFullStart()}:${node.getFullWidth()}`;
}
