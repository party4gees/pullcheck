/**
 * prDraftFilter.js
 * Utilities for filtering and annotating PRs based on draft status.
 */

/**
 * Returns true if the PR is currently a draft.
 * @param {object} pr
 * @returns {boolean}
 */
function isDraft(pr) {
  return pr.draft === true;
}

/**
 * Filters out draft PRs from a list.
 * @param {object[]} prs
 * @returns {object[]}
 */
function filterDrafts(prs) {
  return prs.filter((pr) => !isDraft(pr));
}

/**
 * Returns only draft PRs from a list.
 * @param {object[]} prs
 * @returns {object[]}
 */
function isolateDrafts(prs) {
  return prs.filter((pr) => isDraft(pr));
}

/**
 * Annotates each PR with a `isDraft` boolean field.
 * @param {object[]} prs
 * @returns {object[]}
 */
function annotateWithDraftStatus(prs) {
  return prs.map((pr) => ({
    ...pr,
    isDraft: isDraft(pr),
  }));
}

/**
 * Given a list of PRs, returns a summary count object.
 * @param {object[]} prs
 * @returns {{ total: number, drafts: number, ready: number }}
 */
function draftSummary(prs) {
  const drafts = isolateDrafts(prs).length;
  return {
    total: prs.length,
    drafts,
    ready: prs.length - drafts,
  };
}

module.exports = {
  isDraft,
  filterDrafts,
  isolateDrafts,
  annotateWithDraftStatus,
  draftSummary,
};
