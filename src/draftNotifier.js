/**
 * draftNotifier.js
 * Builds Slack messages to notify about draft PRs that have been
 * sitting open for a while without being marked ready.
 */

const { isDraft } = require('./prDraftFilter');
const { daysSince } = require('./stalePRDetector');

const DEFAULT_STALE_DRAFT_DAYS = 5;

/**
 * Formats a single draft PR line for a Slack message.
 * @param {object} pr
 * @returns {string}
 */
function formatDraftLine(pr) {
  const age = daysSince(pr.created_at);
  return `• *<${pr.html_url}|${pr.title}>* — draft for ${age}d (author: @${pr.user?.login ?? 'unknown'})`;
}

/**
 * Filters PRs that are drafts and have been open longer than the threshold.
 * @param {object[]} prs
 * @param {number} [thresholdDays]
 * @returns {object[]}
 */
function filterStaleDrafts(prs, thresholdDays = DEFAULT_STALE_DRAFT_DAYS) {
  return prs.filter(
    (pr) => isDraft(pr) && daysSince(pr.created_at) >= thresholdDays
  );
}

/**
 * Builds a Slack block message for stale draft PRs.
 * @param {object[]} prs - already filtered stale draft PRs
 * @param {string} repoName
 * @returns {object|null}
 */
function buildDraftAlertMessage(prs, repoName) {
  if (!prs.length) return null;

  const lines = prs.map(formatDraftLine).join('\n');

  return {
    text: `Draft PR reminder for *${repoName}*`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `:pencil: *Stale Draft PRs in ${repoName}* (${prs.length})\n${lines}`,
        },
      },
    ],
  };
}

module.exports = {
  formatDraftLine,
  filterStaleDrafts,
  buildDraftAlertMessage,
};
