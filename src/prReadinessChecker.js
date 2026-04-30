/**
 * prReadinessChecker.js
 * Determines whether a PR is ready to merge based on approvals,
 * checks, conflicts, and draft status.
 */

/**
 * @param {object} pr - Annotated PR object
 * @param {object} options
 * @param {number} options.requiredApprovals - Minimum approvals needed (default 1)
 * @returns {string[]} List of reasons the PR is NOT ready
 */
function getReadinessBlockers(pr, options = {}) {
  const { requiredApprovals = 1 } = options;
  const blockers = [];

  if (pr.draft) {
    blockers.push('PR is still a draft');
  }

  if (pr.conflictStatus === 'conflicted') {
    blockers.push('PR has merge conflicts');
  }

  if (pr.conflictStatus === 'behind') {
    blockers.push('PR is behind base branch');
  }

  const approvalCount = (pr.approvals || []).length;
  if (approvalCount < requiredApprovals) {
    blockers.push(`Needs ${requiredApprovals - approvalCount} more approval(s) (has ${approvalCount})`);
  }

  if ((pr.blockers || []).includes('failing_checks')) {
    blockers.push('CI checks are failing');
  }

  if ((pr.blockers || []).includes('changes_requested')) {
    blockers.push('Changes have been requested');
  }

  return blockers;
}

/**
 * @param {object} pr
 * @param {object} options
 * @returns {boolean}
 */
function isReady(pr, options = {}) {
  return getReadinessBlockers(pr, options).length === 0;
}

/**
 * Annotates each PR with readiness info.
 * @param {object[]} prs
 * @param {object} options
 * @returns {object[]}
 */
function annotateWithReadiness(prs, options = {}) {
  return prs.map(pr => ({
    ...pr,
    ready: isReady(pr, options),
    readinessBlockers: getReadinessBlockers(pr, options),
  }));
}

/**
 * Filters to only PRs that are fully ready to merge.
 * @param {object[]} prs
 * @param {object} options
 * @returns {object[]}
 */
function filterReadyPRs(prs, options = {}) {
  return prs.filter(pr => isReady(pr, options));
}

module.exports = { getReadinessBlockers, isReady, annotateWithReadiness, filterReadyPRs };
