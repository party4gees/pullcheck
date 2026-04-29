/**
 * reviewLagNotifier.js
 * Formats Slack messages for PRs with high review lag.
 */

const LAG_EMOJI = {
  low: '🟢',
  medium: '🟡',
  high: '🟠',
  critical: '🔴',
};

/**
 * Formats a single PR line for the review lag alert.
 * @param {Object} pr - annotated PR
 * @returns {string}
 */
function formatReviewLagLine(pr) {
  const emoji = LAG_EMOJI[pr.reviewLagTier] ?? '⚪';
  const days = (pr.reviewLagHours / 24).toFixed(1);
  return `${emoji} *<${pr.html_url}|#${pr.number} ${pr.title}>* — waiting ${days}d (${pr.reviewLagTier})`;
}

/**
 * Filters PRs to only those at 'high' or 'critical' lag tier.
 * @param {Array} prs - annotated PRs
 * @returns {Array}
 */
function filterHighLagPRs(prs) {
  return prs.filter(
    (pr) => pr.reviewLagTier === 'high' || pr.reviewLagTier === 'critical'
  );
}

/**
 * Builds a Slack Block Kit message for review lag alerts.
 * @param {Array} prs - annotated PRs (pre-filtered if desired)
 * @param {string} repoName
 * @returns {Object} Slack message payload
 */
function buildReviewLagMessage(prs, repoName = 'repo') {
  if (!prs || prs.length === 0) {
    return {
      text: `✅ No review lag issues in *${repoName}*.`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `✅ No review lag issues in *${repoName}*.`,
          },
        },
      ],
    };
  }

  const lines = prs.map(formatReviewLagLine).join('\n');
  const text = `⏳ *Review Lag Alert — ${repoName}* (${prs.length} PR${prs.length !== 1 ? 's' : ''})`;

  return {
    text,
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: `⏳ Review Lag Alert — ${repoName}` },
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: lines },
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `${prs.length} PR${prs.length !== 1 ? 's' : ''} awaiting reviewer attention`,
          },
        ],
      },
    ],
  };
}

module.exports = { formatReviewLagLine, filterHighLagPRs, buildReviewLagMessage };
