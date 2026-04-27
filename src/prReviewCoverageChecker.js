/**
 * prReviewCoverageChecker.js
 * Checks whether PRs have adequate reviewer coverage assigned.
 */

/**
 * Returns true if the PR has at least one requested reviewer.
 * @param {object} pr
 * @returns {boolean}
 */
function hasReviewerAssigned(pr) {
  return Array.isArray(pr.requested_reviewers) && pr.requested_reviewers.length > 0;
}

/**
 * Returns true if the PR has been approved by at least `minApprovals` reviewers.
 * @param {object} pr
 * @param {number} minApprovals
 * @returns {boolean}
 */
function hasEnoughApprovals(pr, minApprovals = 1) {
  const approvals = (pr.reviews || []).filter(r => r.state === 'APPROVED');
  return approvals.length >= minApprovals;
}

/**
 * Identifies PRs that are missing reviewer assignments.
 * @param {object[]} prs
 * @returns {object[]}
 */
function filterUncoveredPRs(prs) {
  return prs.filter(pr => !hasReviewerAssigned(pr));
}

/**
 * Annotates each PR with a coverage summary object.
 * @param {object[]} prs
 * @param {number} minApprovals
 * @returns {object[]}
 */
function annotateWithCoverage(prs, minApprovals = 1) {
  return prs.map(pr => ({
    ...pr,
    coverage: {
      hasReviewer: hasReviewerAssigned(pr),
      approved: hasEnoughApprovals(pr, minApprovals),
      reviewerCount: (pr.requested_reviewers || []).length,
      approvalCount: (pr.reviews || []).filter(r => r.state === 'APPROVED').length,
    },
  }));
}

module.exports = {
  hasReviewerAssigned,
  hasEnoughApprovals,
  filterUncoveredPRs,
  annotateWithCoverage,
};
