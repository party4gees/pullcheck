/**
 * prBlockerDetector.js
 * Detects PRs that are blocked by failing checks, requested changes, or missing approvals.
 */

/**
 * Returns true if any check run has a failing or error conclusion.
 * @param {object} pr
 * @returns {boolean}
 */
function hasFailingChecks(pr) {
  const checks = pr.checkRuns || [];
  return checks.some((c) => c.conclusion === 'failure' || c.conclusion === 'error');
}

/**
 * Returns true if any reviewer has submitted a 'changes_requested' review.
 * @param {object} pr
 * @returns {boolean}
 */
function hasChangesRequested(pr) {
  const reviews = pr.reviews || [];
  return reviews.some((r) => r.state === 'CHANGES_REQUESTED');
}

/**
 * Returns a list of blocker reasons for a given PR.
 * @param {object} pr
 * @returns {string[]}
 */
function getBlockers(pr) {
  const blockers = [];
  if (hasFailingChecks(pr)) blockers.push('failing_checks');
  if (hasChangesRequested(pr)) blockers.push('changes_requested');
  return blockers;
}

/**
 * Annotates each PR with a `blockers` array.
 * @param {object[]} prs
 * @returns {object[]}
 */
function annotateWithBlockers(prs) {
  return prs.map((pr) => ({
    ...pr,
    blockers: getBlockers(pr),
  }));
}

/**
 * Filters PRs that have at least one blocker.
 * @param {object[]} prs
 * @returns {object[]}
 */
function filterBlockedPRs(prs) {
  return prs.filter((pr) => getBlockers(pr).length > 0);
}

module.exports = {
  hasFailingChecks,
  hasChangesRequested,
  getBlockers,
  annotateWithBlockers,
  filterBlockedPRs,
};
