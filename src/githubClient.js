const { Octokit } = require('@octokit/rest');

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

/**
 * Fetches all open pull requests for a given repo.
 * @param {string} owner - Repo owner (org or user)
 * @param {string} repo - Repo name
 * @returns {Promise<Array>} List of open PRs
 */
async function getOpenPullRequests(owner, repo) {
  const pullRequests = [];
  let page = 1;

  while (true) {
    const { data } = await octokit.pulls.list({
      owner,
      repo,
      state: 'open',
      per_page: 100,
      page,
    });

    if (data.length === 0) break;

    pullRequests.push(...data);
    page++;
  }

  return pullRequests;
}

/**
 * Fetches requested reviewers for a given pull request.
 * @param {string} owner
 * @param {string} repo
 * @param {number} pullNumber
 * @returns {Promise<Array>} List of reviewer logins
 */
async function getRequestedReviewers(owner, repo, pullNumber) {
  const { data } = await octokit.pulls.listRequestedReviewers({
    owner,
    repo,
    pull_number: pullNumber,
  });

  return [
    ...data.users.map((u) => u.login),
    ...data.teams.map((t) => t.slug),
  ];
}

module.exports = { getOpenPullRequests, getRequestedReviewers };
