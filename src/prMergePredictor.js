/**
 * prMergePredictor.js
 * Predicts likelihood of a PR merging soon based on activity signals.
 */

const WEIGHTS = {
  approvals: 30,
  recentComment: 15,
  assignedReviewer: 10,
  shortAge: 20,
  ciPassing: 25,
};

/**
 * Compute a merge likelihood score (0–100) for a PR.
 * @param {object} pr
 * @param {object} opts
 * @returns {number}
 */
function predictMergeLikelihood(pr, opts = {}) {
  let score = 0;

  const approvals = pr.approvals ?? 0;
  if (approvals >= 2) score += WEIGHTS.approvals;
  else if (approvals === 1) score += Math.round(WEIGHTS.approvals * 0.5);

  const daysSinceComment = opts.daysSinceLastComment ?? Infinity;
  if (daysSinceComment <= 1) score += WEIGHTS.recentComment;
  else if (daysSinceComment <= 3) score += Math.round(WEIGHTS.recentComment * 0.5);

  if (pr.reviewers && pr.reviewers.length > 0) score += WEIGHTS.assignedReviewer;

  const age = pr.ageDays ?? Infinity;
  if (age <= 3) score += WEIGHTS.shortAge;
  else if (age <= 7) score += Math.round(WEIGHTS.shortAge * 0.5);

  if (opts.ciPassing === true) score += WEIGHTS.ciPassing;

  return Math.min(100, score);
}

/**
 * Classify a score into a human-readable tier.
 * @param {number} score
 * @returns {string}
 */
function mergeTier(score) {
  if (score >= 75) return 'high';
  if (score >= 45) return 'medium';
  return 'low';
}

/**
 * Annotate an array of PRs with merge prediction data.
 * @param {object[]} prs
 * @param {Function} optsResolver  (pr) => opts
 * @returns {object[]}
 */
function annotatePRsWithPrediction(prs, optsResolver = () => ({})) {
  return prs.map((pr) => {
    const score = predictMergeLikelihood(pr, optsResolver(pr));
    return { ...pr, mergeScore: score, mergeTier: mergeTier(score) };
  });
}

module.exports = { predictMergeLikelihood, mergeTier, annotatePRsWithPrediction };
