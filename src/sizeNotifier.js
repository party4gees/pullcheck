/**
 * sizeNotifier.js
 * Builds Slack messages alerting teams about oversized pull requests.
 */

const { classifySize, sizeEmoji } = require('./prSizeClassifier');

const LARGE_SIZES = new Set(['large', 'xl']);

/**
 * Formats a single oversized PR line for Slack.
 * @param {object} pr
 * @returns {string}
 */
function formatSizeLine(pr) {
  const size = pr.size || classifySize(pr);
  const emoji = pr.sizeEmoji || sizeEmoji(size);
  const lines = (pr.additions || 0) + (pr.deletions || 0);
  return `${emoji} *<${pr.html_url}|#${pr.number} ${pr.title}>* — ${size.toUpperCase()} (${lines} lines, ${pr.changed_files || 0} files)`;
}

/**
 * Filters PRs that are considered oversized (large or xl).
 * @param {object[]} prs
 * @returns {object[]}
 */
function filterOversized(prs) {
  return prs.filter((pr) => {
    const size = pr.size || classifySize(pr);
    return LARGE_SIZES.has(size);
  });
}

/**
 * Builds a Slack message block listing oversized PRs.
 * @param {object[]} prs - Already annotated or raw PRs
 * @param {string} repoName
 * @returns {string|null}
 */
function buildSizeAlertMessage(prs, repoName = 'repo') {
  const oversized = filterOversized(prs);
  if (oversized.length === 0) return null;

  const header = `🔴 *Oversized PRs detected in ${repoName}* (${oversized.length} PR${oversized.length > 1 ? 's' : ''})`;
  const lines = oversized.map(formatSizeLine).join('\n');
  return `${header}\n${lines}`;
}

module.exports = { formatSizeLine, filterOversized, buildSizeAlertMessage };
