// reviewerStatsNotifier.js
// Builds Slack messages summarizing reviewer performance stats

const { buildReviewerStats, filterSlowReviewers } = require('./prReviewerStatsTracker');

/**
 * Formats a single reviewer stat line.
 * @param {string} reviewer
 * @param {{ assigned: number, reviewed: number, avgLagHours: number }} stats
 * @returns {string}
 */
function formatReviewerStatLine(reviewer, stats) {
  const coverage =
    stats.assigned > 0
      ? Math.round((stats.reviewed / stats.assigned) * 100)
      : 0;
  const lagLabel =
    stats.avgLagHours >= 72 ? '🔴' : stats.avgLagHours >= 24 ? '🟡' : '🟢';
  return `${lagLabel} *${reviewer}* — assigned: ${stats.assigned}, reviewed: ${stats.reviewed} (${coverage}%), avg lag: ${stats.avgLagHours}h`;
}

/**
 * Builds a Slack block message for reviewer stats.
 * @param {object[]} prs - annotated PR list
 * @param {{ minAvgHours?: number, title?: string }} options
 * @returns {object} Slack blocks payload
 */
function buildReviewerStatsMessage(prs, options = {}) {
  const { minAvgHours = 24, title = 'Reviewer Activity Summary' } = options;
  const statsMap = buildReviewerStats(prs);

  if (statsMap.size === 0) {
    return {
      blocks: [
        { type: 'section', text: { type: 'mrkdwn', text: `*${title}*\nNo reviewer data available.` } },
      ],
    };
  }

  const slowReviewers = filterSlowReviewers(statsMap, minAvgHours);
  const lines =
    slowReviewers.length > 0
      ? slowReviewers.map(({ reviewer, stats }) => formatReviewerStatLine(reviewer, stats))
      : Array.from(statsMap.entries()).map(([r, s]) => formatReviewerStatLine(r, s));

  const headerText =
    slowReviewers.length > 0
      ? `*${title}* — ${slowReviewers.length} reviewer(s) with high lag (≥${minAvgHours}h)`
      : `*${title}*`;

  return {
    blocks: [
      { type: 'section', text: { type: 'mrkdwn', text: headerText } },
      { type: 'divider' },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: lines.join('\n') },
      },
    ],
  };
}

module.exports = { formatReviewerStatLine, buildReviewerStatsMessage };
