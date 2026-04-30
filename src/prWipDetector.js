/**
 * prWipDetector.js
 * Detects Work-In-Progress PRs based on title prefixes and labels.
 */

const WIP_PREFIXES = ['wip:', 'wip -', '[wip]', 'do not merge', 'draft:'];
const WIP_LABELS = ['wip', 'work in progress', 'do not merge'];

/**
 * Returns true if the PR title indicates WIP.
 * @param {string} title
 * @returns {boolean}
 */
function isWipTitle(title) {
  if (!title) return false;
  const lower = title.toLowerCase().trim();
  return WIP_PREFIXES.some(prefix => lower.startsWith(prefix));
}

/**
 * Returns true if any of the PR's labels indicate WIP.
 * @param {string[]} labels
 * @returns {boolean}
 */
function isWipLabel(labels = []) {
  return labels.some(l => WIP_LABELS.includes(l.toLowerCase()));
}

/**
 * Returns true if the PR is considered WIP by title or label.
 * @param {{ title: string, labels: string[], draft: boolean }} pr
 * @returns {boolean}
 */
function isWip(pr) {
  return !!(pr.draft || isWipTitle(pr.title) || isWipLabel(pr.labels));
}

/**
 * Annotates each PR with a `wip` boolean field.
 * @param {object[]} prs
 * @returns {object[]}
 */
function annotateWithWip(prs) {
  return prs.map(pr => ({ ...pr, wip: isWip(pr) }));
}

/**
 * Filters out WIP PRs, returning only non-WIP ones.
 * @param {object[]} prs
 * @returns {object[]}
 */
function filterWip(prs) {
  return prs.filter(pr => !isWip(pr));
}

/**
 * Isolates only WIP PRs.
 * @param {object[]} prs
 * @returns {object[]}
 */
function isolateWip(prs) {
  return prs.filter(pr => isWip(pr));
}

module.exports = { isWipTitle, isWipLabel, isWip, annotateWithWip, filterWip, isolateWip };
