import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

/**
 * Real import lines for utility pages.
 *
 * Titles are not export names (`clickOutside` is exported as `ClickOutside`), so we never guess
 * from the title. Order of truth:
 *   1. the page's own `import { … } from '<entryPoint>'` line;
 *   2. the entry point's public API in libs/ngxtension/<name>/src/index.ts.
 */

// Astro runs from docs/, the library lives next to it.
const LIBS = resolve(process.cwd(), '..', 'libs', 'ngxtension');

const cache = new Map<string, string[]>();

function exportsFromFile(file: string, seen = new Set<string>()): string[] {
	if (seen.has(file) || !existsSync(file)) return [];
	seen.add(file);
	const src = readFileSync(file, 'utf8');
	const names: string[] = [];

	for (const m of src.matchAll(
		/export\s+(?:declare\s+)?(?:abstract\s+)?(?:async\s+)?(?:function\*?|const|let|class|enum)\s+([A-Za-z_$][\w$]*)/g,
	)) {
		names.push(m[1]);
	}
	for (const m of src.matchAll(
		/export\s*\{([^}]*)\}\s*(?:from\s*['"]([^'"]+)['"])?/g,
	)) {
		for (const part of m[1].split(',')) {
			const name = part
				.trim()
				.replace(/^type\s+/, '')
				.split(/\s+as\s+/)
				.pop()
				?.trim();
			if (name && !part.trim().startsWith('type ')) names.push(name);
		}
	}
	for (const m of src.matchAll(/export\s*\*\s*from\s*['"](\.[^'"]+)['"]/g)) {
		const base = resolve(dirname(file), m[1]);
		const target = [`${base}.ts`, resolve(base, 'index.ts')].find(existsSync);
		if (target) names.push(...exportsFromFile(target, seen));
	}
	return [...new Set(names)];
}

/** Public value exports of an `ngxtension/<name>` entry point, read from the library source. */
export function entryPointExports(entryPoint: string): string[] {
	if (!entryPoint.startsWith('ngxtension/')) return [];
	if (!cache.has(entryPoint)) {
		const dir = entryPoint.slice('ngxtension/'.length);
		cache.set(
			entryPoint,
			exportsFromFile(resolve(LIBS, dir, 'src', 'index.ts')),
		);
	}
	return cache.get(entryPoint)!;
}

/** Names from the first `import { … } from '<entryPoint>'` in the page body. */
function namesFromDoc(body: string | undefined, entryPoint: string): string[] {
	if (!body) return [];
	const esc = entryPoint.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
	const m = body.match(
		new RegExp(`import\\s*\\{([^}]*)\\}\\s*from\\s*['"]${esc}['"]`),
	);
	if (!m) return [];
	return m[1]
		.split(',')
		.map((p) => p.trim())
		.filter((p) => p && !p.startsWith('type '))
		.map((p) => p.split(/\s+as\s+/)[0].trim());
}

/**
 * The names to show in `import { … } from '<entryPoint>'`, or [] when the page has no real import
 * (migrations, overview pages).
 */
export function importNames(
	entryPoint: string | undefined,
	title: string,
	body?: string,
): string[] {
	if (!entryPoint?.startsWith('ngxtension/')) return [];
	const fromDoc = namesFromDoc(body, entryPoint);
	if (fromDoc.length) return fromDoc.slice(0, 3);

	const all = entryPointExports(entryPoint);
	if (!all.length) return [];
	const wanted = title
		.split(/\s*\/\s*/)
		.map((t) => t.trim().toLowerCase())
		.filter(Boolean);
	const matched = all.filter((n) => wanted.includes(n.toLowerCase()));
	return (matched.length ? matched : all.slice(0, 1)).slice(0, 3);
}

export function importLine(
	entryPoint: string | undefined,
	names: string[],
): string | undefined {
	if (!entryPoint || !names.length) return undefined;
	return `import { ${names.join(', ')} } from '${entryPoint}';`;
}
