/**
 * blockerNotifier.js
 * Formats Slack messages for PRs that are blocked by failing checks or change requests.
 */

const BLOCKER_LABELS = {
  failing_checks: '🔴 Failing checks',
  changes_requested: '🔁 Changes requested',
};

/**
 * Formats a single blocked PR as a Slack message line.
 * @param {object} pr
 * @returns {string}
 */
function formatBlockerLine(pr) {
  const blockers = (pr.blockers || []).map((b) => BLOCKER_LABELS[b] || b).join(', ');
  const url = pr.html_url || pr.url || '#';
  return `• *<${url}|#${pr.number} ${pr.title}>* — ${blockers}`;
}

/**
 * Builds a Slack block-kit compatible message summarising all blocked PRs.
 * @param {object[]} blockedPRs - PRs already annotated with `blockers`
 * @param {string} [repo]
 * @returns {object}
 */
function buildBlockerAlertMessage(blockedPRs, repo = '') {
  if (!blockedPRs || blockedPRs.length === 0) {
    return { text: 'No blocked PRs found.' };
  }

  const header = repo
    ? `:no_entry: *Blocked PRs in ${repo}* (${blockedPRs.length})`
    : `:no_entry: *Blocked PRs* (${blockedPRs.length})`;

  const lines = blockedPRs.map(formatBlockerLine).join('\n');

  return {
    text: header,
    blocks: [
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `${header}\n${lines}` },
      },
    ],
  };
}

module.exports = {
  formatBlockerLine,
  buildBlockerAlertMessage,
};
