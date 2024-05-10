import { SourceFile } from 'ts-morph';

export function importFrom(
	namedImport: string,
	libName: string,
	sourceFile: SourceFile,
) {
	const libImportExists = sourceFile.getImportDeclaration((importDecl) => {
		return importDecl.getModuleSpecifierValue() === libName;
	});
	if (libImportExists) {
		if (
			!libImportExists
				.getNamedImports()
				.find((named) => named.getName() === namedImport)
		) {
			libImportExists.addNamedImport(namedImport);
		}
	} else {
		sourceFile.addImportDeclaration({
			namedImports: [namedImport],
			moduleSpecifier: libName,
		});
	}
}

export function removeImport(
	namedImport: string,
	libName: string,
	sourceFile: SourceFile,
) {
	const libImport = sourceFile.getImportDeclaration((importDecl) => {
		return importDecl.getModuleSpecifierValue() === libName;
	});
	if (libImport) {
		const namedImportToRemove = libImport
			.getNamedImports()
			.find((named) => named.getName() === namedImport);
		if (namedImportToRemove) {
			namedImportToRemove.remove();
		}
	}
}
