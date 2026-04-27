/**
 * prOwnershipTracker.js
 * Tracks which team member "owns" a PR for follow-up purposes.
 * Ownership is determined by who last interacted (review, comment, assignment).
 */

/**
 * Returns the GitHub login of the most recent actor on a PR.
 * Falls back to the PR author if no activity found.
 * @param {object} pr
 * @returns {string}
 */
function resolveOwner(pr) {
  const candidates = [];

  if (pr.assignees && pr.assignees.length > 0) {
    candidates.push({ login: pr.assignees[0].login, weight: 3 });
  }

  if (pr.requested_reviewers && pr.requested_reviewers.length > 0) {
    candidates.push({ login: pr.requested_reviewers[0].login, weight: 2 });
  }

  if (pr.user && pr.user.login) {
    candidates.push({ login: pr.user.login, weight: 1 });
  }

  if (candidates.length === 0) return 'unknown';

  candidates.sort((a, b) => b.weight - a.weight);
  return candidates[0].login;
}

/**
 * Annotates each PR with an `owner` field.
 * @param {object[]} prs
 * @returns {object[]}
 */
function annotateWithOwner(prs) {
  return prs.map(pr => ({ ...pr, owner: resolveOwner(pr) }));
}

/**
 * Groups PRs by their resolved owner.
 * @param {object[]} prs - should already be annotated
 * @returns {Record<string, object[]>}
 */
function groupByOwner(prs) {
  return prs.reduce((acc, pr) => {
    const owner = pr.owner || resolveOwner(pr);
    if (!acc[owner]) acc[owner] = [];
    acc[owner].push(pr);
    return acc;
  }, {});
}

/**
 * Returns PRs where the owner matches a given login.
 * @param {object[]} prs
 * @param {string} login
 * @returns {object[]}
 */
function filterByOwner(prs, login) {
  return prs.filter(pr => (pr.owner || resolveOwner(pr)) === login);
}

module.exports = { resolveOwner, annotateWithOwner, groupByOwner, filterByOwner };
