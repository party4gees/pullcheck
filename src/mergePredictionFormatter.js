/**
 * mergePredictionFormatter.js
 * Formats merge prediction results for Slack output.
 */

const TIER_EMOJI = {
  high: '🟢',
  medium: '🟡',
  low: '🔴',
};

/**
 * Format a single PR prediction as a Slack line.
 * @param {object} pr  Must have mergeScore, mergeTier, title, url
 * @returns {string}
 */
function formatPredictionLine(pr) {
  const emoji = TIER_EMOJI[pr.mergeTier] ?? '⚪';
  const score = pr.mergeScore ?? 0;
  return `${emoji} *<${pr.url}|${pr.title}>* — merge likelihood: ${score}/100 (${pr.mergeTier})`;
}

/**
 * Build a full Slack block message summarising merge predictions.
 * @param {object[]} prs  Annotated PRs from annotatePRsWithPrediction
 * @returns {object}  Slack message payload
 */
function buildMergePredictionMessage(prs) {
  if (!prs || prs.length === 0) {
    return { text: 'No PRs to predict merge likelihood for.' };
  }

  const sorted = [...prs].sort((a, b) => (b.mergeScore ?? 0) - (a.mergeScore ?? 0));

  const lines = sorted.map(formatPredictionLine);

  return {
    text: '📊 PR Merge Likelihood Report',
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: '📊 PR Merge Likelihood Report' },
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: lines.join('\n') },
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `_${prs.length} PR(s) evaluated — 🟢 high · 🟡 medium · 🔴 low_`,
          },
        ],
      },
    ],
  };
}

module.exports = { formatPredictionLine, buildMergePredictionMessage };
