/**
 * prApprovalTracker.js
 * Tracks approval state of pull requests — how many approvals,
 * who approved, and whether approval threshold is met.
 */

const DEFAULT_REQUIRED_APPROVALS = 1;

/**
 * Returns list of approving reviews for a PR.
 * @param {object} pr
 * @returns {Array}
 */
function getApprovals(pr) {
  const reviews = pr.reviews || [];
  return reviews.filter(r => r.state === 'APPROVED');
}

/**
 * Returns list of reviewers who requested changes.
 * @param {object} pr
 * @returns {Array}
 */
function getChangeRequests(pr) {
  const reviews = pr.reviews || [];
  return reviews.filter(r => r.state === 'CHANGES_REQUESTED');
}

/**
 * Checks if the PR has met the required approval count.
 * @param {object} pr
 * @param {number} required
 * @returns {boolean}
 */
function isFullyApproved(pr, required = DEFAULT_REQUIRED_APPROVALS) {
  return getApprovals(pr).length >= required;
}

/**
 * Annotates each PR with approval metadata.
 * @param {Array} prs
 * @param {number} required
 * @returns {Array}
 */
function annotateWithApprovalStatus(prs, required = DEFAULT_REQUIRED_APPROVALS) {
  return prs.map(pr => {
    const approvals = getApprovals(pr);
    const changeRequests = getChangeRequests(pr);
    return {
      ...pr,
      approvalCount: approvals.length,
      approvedBy: approvals.map(r => r.user?.login).filter(Boolean),
      changeRequestCount: changeRequests.length,
      fullyApproved: approvals.length >= required,
    };
  });
}

/**
 * Filters PRs that have not yet met the approval threshold.
 * @param {Array} prs
 * @param {number} required
 * @returns {Array}
 */
function filterUnapproved(prs, required = DEFAULT_REQUIRED_APPROVALS) {
  return prs.filter(pr => !isFullyApproved(pr, required));
}

module.exports = {
  getApprovals,
  getChangeRequests,
  isFullyApproved,
  annotateWithApprovalStatus,
  filterUnapproved,
};
