module.exports = async ({ github, context }) => {
	const creator = context.payload.sender.login;

	if (creator.includes('allcontributors')) {
		return;
	}

	const prNumber = context.payload.number;
	const owner = context.payload.repository.owner.login;
	const repo = context.payload.repository.name;

	const comments = await github.rest.issues.listComments({
		owner,
		repo,
		issue_number: prNumber,
	});

	for (const comment of comments?.data || []) {
		if (comment.user.login.includes('allcontributors')) {
			console.log(
				`[merge contributors workflow] found all-contributors comment ${comment.body}`
			);
			const allContributorsPr = comment.body.match(/\/pull\/(\d+)/)?.[1];

			if (allContributorsPr) {
				const pr = await github.rest.pulls.get({
					owner,
					repo,
					pull_number: allContributorsPr,
				});

				console.log(
					`[merge contributors workflow] found all-contributors PR ${pr}`
				);

				if (pr && pr.mergeable) {
					console.log(
						`[merge contributors workflow] merging ${allContributorsPr} on ${owner}/${repo}`
					);
					await github.rest.pulls.merge({
						owner,
						repo,
						pull_number: pr.number,
					});
				}
			}
			break;
		}
	}
};
