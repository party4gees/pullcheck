/**
 * ownershipNotifier.js
 * Builds Slack messages alerting PR owners about their open PRs.
 */

const { groupByOwner } = require('./prOwnershipTracker');

/**
 * Formats a single PR line for an ownership digest.
 * @param {object} pr
 * @returns {string}
 */
function formatOwnershipLine(pr) {
  const age = pr.staleDays !== undefined ? ` — ${pr.staleDays}d old` : '';
  const url = pr.html_url ? ` <${pr.html_url}|#${pr.number}>` : ` #${pr.number}`;
  return `•${url} ${pr.title}${age}`;
}

/**
 * Builds a Slack message block for a single owner's PRs.
 * @param {string} slackHandle - e.g. "@alice"
 * @param {object[]} prs
 * @returns {string}
 */
function buildOwnerDigest(slackHandle, prs) {
  const lines = prs.map(formatOwnershipLine).join('\n');
  return `👤 *${slackHandle}*, you own ${prs.length} open PR(s):\n${lines}`;
}

/**
 * Builds one Slack message per owner, using a reviewer map for Slack handles.
 * @param {object[]} prs - annotated with `owner`
 * @param {Record<string, string>} reviewerMap - github login -> slack handle
 * @returns {{ handle: string, message: string }[]}
 */
function buildOwnershipMessages(prs, reviewerMap = {}) {
  const groups = groupByOwner(prs);
  return Object.entries(groups).map(([login, ownerPRs]) => {
    const handle = reviewerMap[login] ? `@${reviewerMap[login]}` : `@${login}`;
    return {
      handle,
      message: buildOwnerDigest(handle, ownerPRs)
    };
  });
}

module.exports = { formatOwnershipLine, buildOwnerDigest, buildOwnershipMessages };
