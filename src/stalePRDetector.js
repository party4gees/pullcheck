const { Octokit } = require('@octokit/rest');

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

/**
 * Returns the number of days between a given date and now.
 * @param {string} dateStr - ISO date string
 * @returns {number}
 */
function daysSince(dateStr) {
  const then = new Date(dateStr);
  const now = new Date();
  const diffMs = now - then;
  return diffMs / (1000 * 60 * 60 * 24);
}

/**
 * Fetches open pull requests for a repo and returns those that are stale.
 * @param {string} owner - GitHub org or user
 * @param {string} repo - Repository name
 * @param {number} staleDays - Number of days without activity to consider stale
 * @returns {Promise<Array>}
 */
async function getStalePullRequests(owner, repo, staleDays = 7) {
  const { data: pullRequests } = await octokit.pulls.list({
    owner,
    repo,
    state: 'open',
    per_page: 100,
  });

  const stale = pullRequests.filter((pr) => {
    const lastActivity = pr.updated_at;
    return daysSince(lastActivity) >= staleDays;
  });

  return stale.map((pr) => ({
    id: pr.number,
    title: pr.title,
    url: pr.html_url,
    author: pr.user.login,
    updatedAt: pr.updated_at,
    daysSinceUpdate: Math.floor(daysSince(pr.updated_at)),
    requestedReviewers: pr.requested_reviewers.map((r) => r.login),
  }));
}

module.exports = { getStalePullRequests, daysSince };
