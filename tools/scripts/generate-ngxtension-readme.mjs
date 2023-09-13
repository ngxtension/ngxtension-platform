// THIS WILL BE MOVED INTO A LOCAL PLUGIN

import devkit from '@nx/devkit';
import { readFileSync, writeFileSync } from 'node:fs';

const { readCachedProjectGraph, readProjectsConfigurationFromProjectGraph } =
	devkit;

const LIB_NAME = 'ngxtension';
const START_MARKER = '<!-- UTILITIES:START -->\n';
const END_MARKER = '\n\n<!-- UTILITIES:END -->\n';
const PATTERN = new RegExp(`${START_MARKER}([\\s\\S]*?)${END_MARKER}`, 'g');

(async () => {
	const projectGraph = readCachedProjectGraph();
	const projects = readProjectsConfigurationFromProjectGraph(projectGraph);

	const projectConfiguration = projects.projects[LIB_NAME];
	const entryPoints = getEntryPoints(projectConfiguration);
	console.log(entryPoints);

	if (!entryPoints.length) return;

	let utilitiesMarkdown = `
|name|link|
|---|---|`;

	for (const entryPoint of entryPoints) {
		utilitiesMarkdown += `
|\`${entryPoint}\`|[README](./libs/${LIB_NAME}/${entryPoint}/README.md)|`;
	}

	const readmeContent = readFileSync('README.md', { encoding: 'utf8' });
	const updatedContent = readmeContent.replace(
		PATTERN,
		`${START_MARKER}${utilitiesMarkdown}${END_MARKER}`
	);

	writeFileSync('README.md', updatedContent);
})();

function getEntryPoints(projectConfiguration) {
	const lintTarget = projectConfiguration.targets['lint'];
	const lintFilePatterns = lintTarget.options.lintFilePatterns;
	const entryPoints = new Set();

	for (const filePattern of lintFilePatterns.slice(3)) {
		const entryPoint = filePattern.split('/')[2];
		if (entryPoints.has(entryPoint)) {
			continue;
		}
		entryPoints.add(entryPoint);
	}

	return Array.from(entryPoints.values());
}
