import {
	Block,
	Element as Element_2,
	HtmlParser,
	ParseTreeResult,
	RecursiveVisitor,
	Text as Text_2,
	visitAll,
} from '@angular-eslint/bundled-angular-compiler';

export function migrateTemplateVariablesToSignals(
	template: string,
	convertedSignals: Set<string>,
): string {
	const parsedTemplate: ParseTreeResult = new HtmlParser().parse(
		template,
		'template.html',
		{
			tokenizeBlocks: true,
		},
	);

	const sortedSignalsFromLongest = Array.from(convertedSignals).sort(
		(a, b) => b.length - a.length,
	);

	const visitor = new ElementCollector(sortedSignalsFromLongest);
	visitAll(visitor, parsedTemplate.rootNodes);

	let changedOffset = 0;
	visitor.elements.forEach((element) => {
		// replace the variable with the new signal variable based on start and end
		const { start, end, value, variables, type } = element;

		if (type === 'interpolation') {
			const replacedValue = replaceVariablesInsideInterpolation(
				value,
				variables,
			);
			template = replaceTemplate(
				template,
				replacedValue,
				start,
				end,
				changedOffset,
			);
			changedOffset += replacedValue.length - value.length;
		} else if (type === 'attribute-binding') {
			// inside attribute binding, we can have interpolation that's why we only replace inside interpolation
			const replacedValue = replaceVariablesInsideInterpolation(
				value,
				variables,
			);
			template = replaceTemplate(
				template,
				replacedValue,
				start,
				end,
				changedOffset,
			);
			changedOffset += replacedValue.length - value.length;
		} else if (type === 'two-way-binding') {
			// we don't need to replace the value for two-way binding
			// as two-way binding works with the same variable
		} else if (type === 'property-binding') {
			const replacedValue = replaceOnlyIfNotWrappedInQuotesOrPropertyAccess(
				value,
				variables,
			);
			template = replaceTemplate(
				template,
				replacedValue,
				start,
				end,
				changedOffset,
			);
			changedOffset += replacedValue.length - value.length;
		} else if (type === 'event-binding') {
			const replacedValue = replaceOnlyIfNotWrappedInQuotesOrPropertyAccess(
				value,
				variables,
			);
			template = replaceTemplate(
				template,
				replacedValue,
				start,
				end,
				changedOffset,
			);
			changedOffset += replacedValue.length - value.length;
		} else if (type === 'structural-directive') {
			const replacedValue = replaceOnlyIfNotWrappedInQuotesOrPropertyAccess(
				value,
				variables,
			);
			template = replaceTemplate(
				template,
				replacedValue,
				start,
				end,
				changedOffset,
			);
			changedOffset += replacedValue.length - value.length;
		} else if (type === 'block') {
			const replacedValue = replaceOnlyIfNotWrappedInQuotesOrPropertyAccess(
				value,
				variables,
			);
			template = replaceTemplate(
				template,
				replacedValue,
				start,
				end,
				changedOffset,
			);
			changedOffset += replacedValue.length - value.length;
		}
	});

	return template;
}

class ElementCollector extends RecursiveVisitor {
	readonly elements: ElementToMigrate[] = [];

	constructor(private variables: string[] = []) {
		super();
	}

	// collect all places where we can have dynamic values
	// 1. interpolation
	// 2. property binding
	// 3. event binding
	// 4. structural directive
	// 5. animations - not supported yet

	override visitText(ast: Text_2, context: any): any {
		if (ast.value.includes('{{')) {
			const usedVariables = collectUsedVariables(ast.value, this.variables);

			if (usedVariables.length) {
				this.elements.push({
					type: 'interpolation',
					value: ast.value,
					variables: usedVariables,
					start: ast.sourceSpan.start.offset,
					end: ast.sourceSpan.end.offset,
				});
			}
		}
		return super.visitText(ast, context);
	}

	override visitElement(element: Element_2, context: any) {
		if (element.attrs.length > 0) {
			for (const attr of element.attrs) {
				if (attr.name.startsWith('[') && attr.name.endsWith(']')) {
					// two-way binding
					if (attr.name.startsWith('[(') && attr.name.endsWith(')]')) {
						const usedVariables = collectUsedVariables(
							attr.value,
							this.variables,
						);

						if (usedVariables.length) {
							this.elements.push({
								type: 'two-way-binding',
								value: attr.value,
								variables: usedVariables,
								start: attr.valueSpan.start.offset,
								end: attr.valueSpan.end.offset,
							});
						}
					} else {
						// property binding
						const usedVariables = collectUsedVariables(
							attr.value,
							this.variables,
						);

						if (usedVariables.length) {
							this.elements.push({
								type: 'property-binding',
								value: attr.value,
								variables: usedVariables,
								start: attr.valueSpan.start.offset,
								end: attr.valueSpan.end.offset,
							});
						}
					}
				}

				if (attr.name.startsWith('(') && attr.name.endsWith(')')) {
					// event binding
					const usedVariables = collectUsedVariables(
						attr.value,
						this.variables,
					);

					if (usedVariables.length) {
						this.elements.push({
							type: 'event-binding',
							value: attr.value,
							variables: usedVariables,
							start: attr.valueSpan.start.offset,
							end: attr.valueSpan.end.offset,
						});
					}
				}

				if (attr.name.startsWith('*')) {
					// structural directive
					const usedVariables = collectUsedVariables(
						attr.value,
						this.variables,
					);

					if (usedVariables.length) {
						this.elements.push({
							type: 'structural-directive',
							value: attr.value,
							variables: usedVariables,
							start: attr.valueSpan.start.offset,
							end: attr.valueSpan.end.offset,
						});
					}
				}

				// attribute bindings
				if (attr.value.includes('{{')) {
					// interpolation inside attribute
					const usedVariables = collectUsedVariables(
						attr.value,
						this.variables,
					);

					if (usedVariables.length) {
						this.elements.push({
							type: 'attribute-binding',
							value: attr.value,
							variables: usedVariables,
							start: attr.valueSpan.start.offset,
							end: attr.valueSpan.end.offset,
						});
					}
				}
			}
		}
		return super.visitElement(element, context);
	}

	override visitBlock(block: Block, context: any): any {
		if (block.parameters.length > 0) {
			block.parameters.forEach((param) => {
				const usedVariables = collectUsedVariables(
					param.expression,
					this.variables,
				);

				if (usedVariables.length) {
					this.elements.push({
						type: 'block', // if, else if, for, switch, case
						value: param.expression,
						variables: usedVariables,
						start: param.sourceSpan.start.offset,
						end: param.sourceSpan.end.offset,
					});
				}
			});
		}
		return super.visitBlock(block, context);
	}
}

function collectUsedVariables(value: string, variables: string[]): string[] {
	const usedVariables = [];
	for (const variable of variables) {
		if (value.includes(variable)) {
			usedVariables.push(variable);
		}
		if (value === variable) {
			break; // if the variable is the only thing in the text, we don't need to check further
		}
	}

	return usedVariables;
}

function replaceVariablesInsideInterpolation(
	value: string,
	variables: string[],
): string {
	// find all interpolations and replace the variables for each interpolation
	value = value.replaceAll(/{{(.*?)}}/g, (match) => {
		const usedVars = [];
		for (const variable of variables) {
			if (match.includes(variable)) {
				usedVars.push(variable);
			}
			if (match === variable) {
				break; // if the variable is the only thing in the text, we don't need to check further
			}
		}

		if (usedVars.length) {
			return replaceOnlyIfNotWrappedInQuotesOrPropertyAccess(match, usedVars);
		}

		return match;
	});

	return value;
}

/**
 * Replace the text only if it's not wrapped in quotes or property access
 */
function replaceOnlyIfNotWrappedInQuotesOrPropertyAccess(
	value: string,
	variables: string[],
): string {
	// replace only if not wrapped in quotes
	// replace only if doesn't start with . (property access)
	// replace only if it doesn't end with : (it's a key-value pair)
	variables.forEach((variable) => {
		const regex = new RegExp(`(?<!['".])\\b${variable}\\b(?!['":])`, 'g');
		value = value.replace(regex, `${variable}()`);
	});

	return value;
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
	type:
		| 'interpolation'
		| 'property-binding'
		| 'attribute-binding'
		| 'event-binding'
		| 'two-way-binding'
		| 'structural-directive'
		| 'block';
	value: string;
	variables: string[];
	start: number;
	end: number;
}
