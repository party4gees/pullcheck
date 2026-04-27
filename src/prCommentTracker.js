/**
 * prCommentTracker.js
 * Tracks last comment activity on pull requests to help determine
 * whether a PR has gone quiet and needs a nudge.
 */

/**
 * Returns the number of days since the last comment on a PR.
 * @param {string|Date} lastCommentAt - ISO date string or Date object
 * @param {Date} [now] - override for current time (useful in tests)
 * @returns {number}
 */
function daysSinceLastComment(lastCommentAt, now = new Date()) {
  if (!lastCommentAt) return Infinity;
  const last = new Date(lastCommentAt);
  const diffMs = now - last;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Determines if a PR has gone quiet based on comment inactivity.
 * @param {object} pr - PR object with `lastCommentAt` field
 * @param {number} quietThresholdDays - days of silence before considered quiet
 * @param {Date} [now]
 * @returns {boolean}
 */
function isQuiet(pr, quietThresholdDays = 3, now = new Date()) {
  const days = daysSinceLastComment(pr.lastCommentAt, now);
  return days >= quietThresholdDays;
}

/**
 * Filters a list of PRs to only those that have gone quiet.
 * @param {object[]} prs
 * @param {number} quietThresholdDays
 * @param {Date} [now]
 * @returns {object[]}
 */
function filterQuietPRs(prs, quietThresholdDays = 3, now = new Date()) {
  return prs.filter((pr) => isQuiet(pr, quietThresholdDays, now));
}

/**
 * Annotates each PR with a `quietDays` field.
 * @param {object[]} prs
 * @param {Date} [now]
 * @returns {object[]}
 */
function annotateWithQuietDays(prs, now = new Date()) {
  return prs.map((pr) => ({
    ...pr,
    quietDays: daysSinceLastComment(pr.lastCommentAt, now),
  }));
}

module.exports = {
  daysSinceLastComment,
  isQuiet,
  filterQuietPRs,
  annotateWithQuietDays,
};
