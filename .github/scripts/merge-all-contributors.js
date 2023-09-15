module.exports = async ({ github, context }) => {
	const prNumber = context.payload.number;
	const owner = context.payload.repository.owner.login;
	const repo = context.payload.repository.name;

	const comments = await github.rest.issues.listComments({
		owner,
		repo,
		issue_number: prNumber,
	});

	for (const comment of comments) {
		if (comment.user.login.includes('allcontributors')) {
			const allContributorsPr = comment.body.match(/\/pull\/(\d+)/)?.[1];
			if (allContributorsPr) {
				const pr = await github.rest.pulls.get({
					owner,
					repo,
					pull_number: allContributorsPr,
				});
				if (pr && pr.mergeable) {
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
