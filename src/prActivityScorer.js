/**
 * prActivityScorer.js
 * Scores pull requests by activity level based on comments, reviews, and age.
 * Higher score = more active / less stale.
 */

const { daysSince } = require('./stalePRDetector');
const { daysSinceLastComment } = require('./prCommentTracker');

const WEIGHTS = {
  recentComment: 10,
  reviewSubmitted: 8,
  commitPushed: 6,
  labelApplied: 3,
  agePenaltyPerDay: 0.5,
};

/**
 * Calculates an activity score for a single PR.
 * @param {Object} pr - PR object with metadata
 * @param {Object} options - optional weight overrides
 * @returns {number} score (higher = more active)
 */
function scorePR(pr, options = {}) {
  const weights = { ...WEIGHTS, ...options };
  let score = 0;

  const quietDays = daysSinceLastComment(pr.comments || []);
  if (quietDays !== null && quietDays < 2) score += weights.recentComment;

  const reviewCount = (pr.reviews || []).length;
  score += reviewCount * weights.reviewSubmitted;

  const commitCount = (pr.commits || []).length;
  score += Math.min(commitCount, 5) * weights.commitPushed;

  const labelCount = (pr.labels || []).length;
  score += labelCount * weights.labelApplied;

  const ageDays = daysSince(pr.created_at);
  score -= ageDays * weights.agePenaltyPerDay;

  return Math.max(0, Math.round(score * 10) / 10);
}

/**
 * Scores an array of PRs and returns them sorted by score descending.
 * @param {Array} prs
 * @param {Object} options
 * @returns {Array<{pr, score}>}
 */
function rankPRsByActivity(prs, options = {}) {
  return prs
    .map((pr) => ({ pr, score: scorePR(pr, options) }))
    .sort((a, b) => b.score - a.score);
}

/**
 * Returns PRs below a given activity threshold.
 * @param {Array} prs
 * @param {number} threshold
 * @returns {Array}
 */
function filterInactivePRs(prs, threshold = 5) {
  return prs.filter((pr) => scorePR(pr) < threshold);
}

module.exports = { scorePR, rankPRsByActivity, filterInactivePRs, WEIGHTS };
