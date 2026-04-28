/**
 * prConflictDetector.js
 * Detects PRs that have merge conflicts or are out of date with base branch.
 */

/**
 * Returns true if the PR has a known merge conflict state.
 * @param {object} pr
 * @returns {boolean}
 */
function hasConflict(pr) {
  return pr.mergeable === false || pr.mergeableState === 'dirty';
}

/**
 * Returns true if the PR is behind its base branch (needs rebase).
 * @param {object} pr
 * @returns {boolean}
 */
function isBehindBase(pr) {
  return pr.mergeableState === 'behind' || pr.mergeableState === 'blocked';
}

/**
 * Annotates each PR with conflict and behind-base flags.
 * @param {object[]} prs
 * @returns {object[]}
 */
function annotateWithConflictStatus(prs) {
  return prs.map((pr) => ({
    ...pr,
    hasConflict: hasConflict(pr),
    isBehindBase: isBehindBase(pr),
  }));
}

/**
 * Filters PRs that have merge conflicts.
 * @param {object[]} prs
 * @returns {object[]}
 */
function filterConflicted(prs) {
  return prs.filter((pr) => hasConflict(pr));
}

/**
 * Filters PRs that are behind their base branch.
 * @param {object[]} prs
 * @returns {object[]}
 */
function filterBehindBase(prs) {
  return prs.filter((pr) => isBehindBase(pr));
}

module.exports = {
  hasConflict,
  isBehindBase,
  annotateWithConflictStatus,
  filterConflicted,
  filterBehindBase,
};
