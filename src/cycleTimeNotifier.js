/**
 * cycleTimeNotifier.js
 * Formats Slack messages for PRs with long cycle times.
 */

const { computeCycleTime, cycleTier } = require('./prCycleTimeTracker');

const TIER_EMOJI = {
  fast: '⚡',
  normal: '✅',
  slow: '🐢',
  stalled: '🚨',
};

/**
 * Formats a single PR as a Slack list entry.
 */
function formatCycleTimeLine(pr) {
  const hours = computeCycleTime(pr);
  const tier = cycleTier(hours);
  const emoji = TIER_EMOJI[tier] || '❓';
  const days = (hours / 24).toFixed(1);
  return `${emoji} *<${pr.url}|#${pr.number} ${pr.title}>* — ${days}d in flight (${tier})`;
}

/**
 * Filters PRs to only those in the 'slow' or 'stalled' tier.
 */
function filterNotableSlowPRs(prs) {
  return prs.filter((pr) => {
    const tier = cycleTier(computeCycleTime(pr));
    return tier === 'slow' || tier === 'stalled';
  });
}

/**
 * Builds a Slack Block Kit message summarising slow cycle-time PRs.
 */
function buildCycleTimeAlertMessage(prs, repoName = 'repo') {
  const notable = filterNotableSlowPRs(prs);
  if (!notable.length) return null;

  const lines = notable.map(formatCycleTimeLine).join('\n');
  const avg = (prs.reduce((s, p) => s + computeCycleTime(p), 0) / prs.length / 24).toFixed(1);

  return {
    text: `Cycle Time Alert — ${repoName}`,
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: `🕐 Slow PRs in ${repoName}`, emoji: true },
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: lines },
      },
      {
        type: 'context',
        elements: [{ type: 'mrkdwn', text: `Avg cycle time across all open PRs: *${avg}d*` }],
      },
    ],
  };
}

module.exports = { formatCycleTimeLine, filterNotableSlowPRs, buildCycleTimeAlertMessage };
