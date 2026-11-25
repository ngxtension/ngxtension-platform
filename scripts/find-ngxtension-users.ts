#!/usr/bin/env tsx

/**
 * Script to find open source GitHub projects using ngxtension
 * and sort them by stars or forks
 */

interface GitHubRepo {
	name: string;
	full_name: string;
	html_url: string;
	description: string | null;
	stargazers_count: number;
	forks_count: number;
	language: string | null;
	updated_at: string;
}

interface SearchResponse {
	total_count: number;
	items: GitHubRepo[];
}

const GITHUB_API = 'https://api.github.com';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

async function searchGitHubRepos(
	query: string,
	page: number = 1,
	perPage: number = 100,
): Promise<SearchResponse> {
	const headers: HeadersInit = {
		Accept: 'application/vnd.github.v3+json',
	};

	if (GITHUB_TOKEN) {
		headers['Authorization'] = `token ${GITHUB_TOKEN}`;
	}

	const url = `${GITHUB_API}/search/code?q=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}`;

	const response = await fetch(url, { headers });

	if (!response.ok) {
		throw new Error(
			`GitHub API error: ${response.status} ${response.statusText}`,
		);
	}

	const data = await response.json();

	// Extract unique repositories from code search results
	const repoMap = new Map<string, GitHubRepo>();

	for (const item of data.items) {
		const repoFullName = item.repository.full_name;
		if (!repoMap.has(repoFullName)) {
			repoMap.set(repoFullName, item.repository);
		}
	}

	return {
		total_count: data.total_count,
		items: Array.from(repoMap.values()),
	};
}

async function getAllRepos(
	query: string,
	maxPages: number = 10,
): Promise<GitHubRepo[]> {
	const allRepos = new Map<string, GitHubRepo>();
	let page = 1;

	while (page <= maxPages) {
		console.log(`Fetching page ${page}...`);

		try {
			const response = await searchGitHubRepos(query, page);

			if (response.items.length === 0) {
				break;
			}

			response.items.forEach((repo) => {
				allRepos.set(repo.full_name, repo);
			});

			page++;

			// Rate limiting: wait a bit between requests
			await new Promise((resolve) => setTimeout(resolve, 1000));
		} catch (error) {
			console.error(`Error fetching page ${page}:`, error);
			break;
		}
	}

	return Array.from(allRepos.values());
}

function sortRepos(
	repos: GitHubRepo[],
	sortBy: 'stars' | 'forks' = 'stars',
): GitHubRepo[] {
	return repos.sort((a, b) => {
		if (sortBy === 'stars') {
			return b.stargazers_count - a.stargazers_count;
		}
		return b.forks_count - a.forks_count;
	});
}

function displayRepos(repos: GitHubRepo[], sortBy: 'stars' | 'forks') {
	console.log(
		`\n📊 Found ${repos.length} unique repositories using ngxtension\n`,
	);
	console.log(`Sorted by: ${sortBy === 'stars' ? '⭐ Stars' : '🔱 Forks'}\n`);
	console.log('─'.repeat(100));

	repos.forEach((repo, index) => {
		const sortValue =
			sortBy === 'stars' ? repo.stargazers_count : repo.forks_count;
		const sortIcon = sortBy === 'stars' ? '⭐' : '🔱';

		console.log(`\n${index + 1}. ${repo.full_name}`);
		console.log(
			`   ${sortIcon} ${sortValue} | Language: ${repo.language || 'N/A'}`,
		);
		console.log(`   🔗 ${repo.html_url}`);

		if (repo.description) {
			console.log(`   📝 ${repo.description}`);
		}
	});

	console.log('\n' + '─'.repeat(100));
}

function saveToJson(
	repos: GitHubRepo[],
	filename: string = 'ngxtension-users.json',
) {
	const fs = require('fs');
	fs.writeFileSync(filename, JSON.stringify(repos, null, 2));
	console.log(`\n✅ Results saved to ${filename}`);
}

async function main() {
	const args = process.argv.slice(2);
	const sortBy = (args[0] === 'forks' ? 'forks' : 'stars') as 'stars' | 'forks';
	const saveJson = args.includes('--save');

	console.log('🔍 Searching for projects using ngxtension...\n');

	if (!GITHUB_TOKEN) {
		console.warn(
			'⚠️  No GITHUB_TOKEN found. API rate limits will be much lower.',
		);
		console.warn(
			'   Set GITHUB_TOKEN environment variable for better results.\n',
		);
	}

	try {
		// Search for package.json files containing ngxtension
		const query =
			'ngxtension filename:package.json language:json -repo:ngxtension/ngxtension-platform';

		const repos = await getAllRepos(query);
		const sortedRepos = sortRepos(repos, sortBy);

		displayRepos(sortedRepos, sortBy);

		if (saveJson) {
			saveToJson(sortedRepos);
		}
	} catch (error) {
		console.error('❌ Error:', error);
		process.exit(1);
	}
}

main();
