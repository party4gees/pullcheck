/**
 * activityDashboard.js
 * Builds a Slack-ready summary block for PR activity scores.
 */

const { rankPRsByActivity, filterInactivePRs } = require('./prActivityScorer');
const { stalenessEmoji } = require('./prAgeFormatter');

/**
 * Formats a single ranked PR entry as a Slack text line.
 * @param {{pr, score}} entry
 * @param {number} index
 * @returns {string}
 */
function formatRankedEntry(entry, index) {
  const { pr, score } = entry;
  const emoji = stalenessEmoji(score > 10 ? 'fresh' : score > 5 ? 'aging' : 'stale');
  const title = pr.title || `PR #${pr.number}`;
  const url = pr.html_url ? ` (<${pr.html_url}|#${pr.number}>)` : '';
  return `${index + 1}. ${emoji} *${title}*${url} — score: ${score}`;
}

/**
 * Builds a Slack Block Kit message summarising PR activity.
 * @param {Array} prs - list of PR objects
 * @param {Object} options
 * @param {number} [options.topN=5] - how many top PRs to show
 * @param {number} [options.inactiveThreshold=5]
 * @returns {Object} Slack block payload
 */
function buildActivityDashboard(prs, options = {}) {
  const { topN = 5, inactiveThreshold = 5 } = options;

  const ranked = rankPRsByActivity(prs);
  const topEntries = ranked.slice(0, topN);
  const inactiveCount = filterInactivePRs(prs, inactiveThreshold).length;

  const lines = topEntries.map((entry, i) => formatRankedEntry(entry, i));

  const headerText = `*📊 PR Activity Dashboard* — ${prs.length} open PR(s)`;
  const bodyText = lines.length
    ? lines.join('\n')
    : '_No open pull requests found._';
  const footerText = `_${inactiveCount} PR(s) below activity threshold (${inactiveThreshold})_`;

  return {
    blocks: [
      { type: 'section', text: { type: 'mrkdwn', text: headerText } },
      { type: 'divider' },
      { type: 'section', text: { type: 'mrkdwn', text: bodyText } },
      { type: 'context', elements: [{ type: 'mrkdwn', text: footerText }] },
    ],
  };
}

module.exports = { buildActivityDashboard, formatRankedEntry };
