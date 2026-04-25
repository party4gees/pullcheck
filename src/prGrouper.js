/**
 * prGrouper.js
 * Groups pull requests by staleness level, reviewer, or label
 * for batch reporting and notifications.
 */

const { getStalenessLevel } = require('./prAgeFormatter');

/**
 * Groups an array of PRs by their staleness level.
 * @param {Array} prs - Array of PR objects with `daysSinceUpdate` field
 * @returns {Object} Map of staleness level -> PR array
 */
function groupByStaleness(prs) {
  return prs.reduce((groups, pr) => {
    const level = getStalenessLevel(pr.daysSinceUpdate);
    if (!groups[level]) groups[level] = [];
    groups[level].push(pr);
    return groups;
  }, {});
}

/**
 * Groups PRs by their assigned reviewer Slack handle.
 * PRs with no reviewer fall under '__unassigned__'.
 * @param {Array} prs - Array of PR objects with optional `reviewerHandle` field
 * @returns {Object} Map of reviewer handle -> PR array
 */
function groupByReviewer(prs) {
  return prs.reduce((groups, pr) => {
    const key = pr.reviewerHandle || '__unassigned__';
    if (!groups[key]) groups[key] = [];
    groups[key].push(pr);
    return groups;
  }, {});
}

/**
 * Groups PRs by a specific label.
 * PRs not carrying the label are excluded from the result.
 * @param {Array} prs - Array of PR objects with `labels` string array
 * @param {string} label - Label name to group by
 * @returns {Array} PRs that include the given label
 */
function filterByLabel(prs, label) {
  return prs.filter(pr => Array.isArray(pr.labels) && pr.labels.includes(label));
}

/**
 * Returns a flat sorted list of PRs ordered by daysSinceUpdate descending.
 * @param {Array} prs
 * @returns {Array}
 */
function sortByStaleness(prs) {
  return [...prs].sort((a, b) => b.daysSinceUpdate - a.daysSinceUpdate);
}

module.exports = { groupByStaleness, groupByReviewer, filterByLabel, sortByStaleness };
