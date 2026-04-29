/**
 * prReviewLagTracker.js
 * Tracks how long PRs have been waiting for a review response.
 */

/**
 * Returns hours between two ISO date strings.
 */
function hoursBetween(a, b) {
  return Math.abs(new Date(b) - new Date(a)) / 36e5;
}

/**
 * Returns hours since the PR was last updated (or created if no update).
 */
function hoursSinceActivity(pr) {
  const ref = pr.updated_at || pr.created_at;
  return hoursBetween(ref, new Date().toISOString());
}

/**
 * Classifies review lag into a tier.
 * @param {number} hours
 * @returns {'low'|'medium'|'high'|'critical'}
 */
function lagTier(hours) {
  if (hours < 24) return 'low';
  if (hours < 72) return 'medium';
  if (hours < 168) return 'high';
  return 'critical';
}

/**
 * Annotates each PR with reviewLagHours and reviewLagTier.
 * @param {Array} prs
 * @returns {Array}
 */
function annotateWithReviewLag(prs) {
  return prs.map((pr) => {
    const reviewLagHours = hoursSinceActivity(pr);
    return {
      ...pr,
      reviewLagHours: Math.round(reviewLagHours),
      reviewLagTier: lagTier(reviewLagHours),
    };
  });
}

/**
 * Filters PRs whose review lag meets or exceeds a minimum hour threshold.
 * @param {Array} prs - already annotated
 * @param {number} minHours
 * @returns {Array}
 */
function filterByReviewLag(prs, minHours = 48) {
  return prs.filter((pr) => (pr.reviewLagHours ?? 0) >= minHours);
}

module.exports = {
  hoursBetween,
  hoursSinceActivity,
  lagTier,
  annotateWithReviewLag,
  filterByReviewLag,
};
