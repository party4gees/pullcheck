/**
 * Resolves GitHub PR reviewers to Slack user IDs
 * using a configurable mapping.
 */

/**
 * Load reviewer map from environment or a provided object.
 * Expected env var: REVIEWER_MAP as JSON string
 * e.g. '{"octocat": "U012AB3CD", "torvalds": "U098ZY7WX"}'
 */
function loadReviewerMap(overrideMap = null) {
  if (overrideMap) return overrideMap;

  const raw = process.env.REVIEWER_MAP;
  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch (err) {
    console.warn('[reviewerResolver] Failed to parse REVIEWER_MAP:', err.message);
    return {};
  }
}

/**
 * Resolve a single GitHub username to a Slack user ID.
 * Returns a Slack mention string or falls back to the GitHub username.
 *
 * @param {string} githubUsername
 * @param {Object} reviewerMap
 * @returns {string}
 */
function resolveReviewer(githubUsername, reviewerMap) {
  const slackId = reviewerMap[githubUsername];
  if (slackId) {
    return `<@${slackId}>`;
  }
  return `@${githubUsername}`;
}

/**
 * Resolve an array of GitHub reviewer logins to Slack mentions.
 *
 * @param {Array<{ login: string }>} reviewers
 * @param {Object|null} overrideMap
 * @returns {string[]}
 */
function resolveReviewers(reviewers, overrideMap = null) {
  const map = loadReviewerMap(overrideMap);
  return reviewers.map((r) => resolveReviewer(r.login, map));
}

module.exports = { loadReviewerMap, resolveReviewer, resolveReviewers };
