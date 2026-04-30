/**
 * wipNotifier.js
 * Builds Slack alert messages for long-running WIP pull requests.
 */

const { isWip } = require('./prWipDetector');
const { daysSince } = require('./stalePRDetector');

const WIP_STALE_DAYS = 3;

/**
 * Formats a single WIP PR line for Slack.
 * @param {object} pr
 * @returns {string}
 */
function formatWipLine(pr) {
  const age = daysSince(pr.created_at);
  const tag = pr.draft ? 'draft' : 'wip';
  return `• *<${pr.html_url}|#${pr.number} ${pr.title}>* [${tag}] — open for *${age}d*`;
}

/**
 * Filters WIP PRs that have been open longer than the stale threshold.
 * @param {object[]} prs
 * @param {number} [staleDays]
 * @returns {object[]}
 */
function filterStaleWip(prs, staleDays = WIP_STALE_DAYS) {
  return prs.filter(pr => isWip(pr) && daysSince(pr.created_at) >= staleDays);
}

/**
 * Builds a Slack message block for stale WIP PRs.
 * @param {object[]} prs
 * @param {object} [opts]
 * @param {string} [opts.repo]
 * @param {number} [opts.staleDays]
 * @returns {string|null}
 */
function buildWipAlertMessage(prs, { repo = '', staleDays = WIP_STALE_DAYS } = {}) {
  const stale = filterStaleWip(prs, staleDays);
  if (stale.length === 0) return null;

  const repoLabel = repo ? ` in *${repo}*` : '';
  const header = `:construction: *${stale.length} stale WIP PR${stale.length > 1 ? 's' : ''}${repoLabel}* (open ≥${staleDays}d):`;
  const lines = stale.map(formatWipLine).join('\n');
  return `${header}\n${lines}`;
}

module.exports = { formatWipLine, filterStaleWip, buildWipAlertMessage };
