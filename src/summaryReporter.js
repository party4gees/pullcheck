const { WebClient } = require('@slack/web-api');

/**
 * Builds a summary Slack message for all stale PRs found in a run.
 * @param {Array} stalePRs - List of stale PR objects
 * @param {string} repoName - Full repo name (owner/repo)
 * @returns {Object} Slack Block Kit message payload
 */
function buildSummaryMessage(stalePRs, repoName) {
  if (!stalePRs || stalePRs.length === 0) {
    return {
      text: `✅ No stale PRs found in *${repoName}*. All caught up!`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `✅ No stale PRs found in *${repoName}*. All caught up!`,
          },
        },
      ],
    };
  }

  const prLines = stalePRs
    .map((pr) => `• <${pr.html_url}|#${pr.number} ${pr.title}> — stale for *${pr.daysStale}d*`)
    .join('\n');

  return {
    text: `⚠️ ${stalePRs.length} stale PR(s) detected in ${repoName}`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `⚠️ Stale PR Summary — ${repoName}`,
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Found *${stalePRs.length}* stale pull request(s):\n\n${prLines}`,
        },
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `_Run by pullcheck · ${new Date().toUTCString()}_`,
          },
        ],
      },
    ],
  };
}

/**
 * Posts the summary message to a Slack channel.
 * @param {string} token - Slack bot token
 * @param {string} channel - Slack channel ID or name
 * @param {Array} stalePRs - List of stale PR objects
 * @param {string} repoName - Full repo name
 */
async function postSummary(token, channel, stalePRs, repoName) {
  const client = new WebClient(token);
  const message = buildSummaryMessage(stalePRs, repoName);

  await client.chat.postMessage({
    channel,
    ...message,
  });
}

module.exports = { buildSummaryMessage, postSummary };
