/**
 * slackNotifier.js
 * Handles sending Slack messages to notify reviewers about stale PRs.
 */

const https = require('https');
const url = require('url');

/**
 * Sends a message to a Slack webhook URL.
 * @param {string} webhookUrl - The Slack incoming webhook URL.
 * @param {object} payload - The Slack message payload.
 * @returns {Promise<void>}
 */
async function sendSlackMessage(webhookUrl, payload) {
  const parsedUrl = url.parse(webhookUrl);
  const body = JSON.stringify(payload);

  return new Promise((resolve, reject) => {
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      if (res.statusCode === 200) {
        resolve();
      } else {
        reject(new Error(`Slack webhook returned status ${res.statusCode}`));
      }
    });

    req.on('error', (err) => reject(err));
    req.write(body);
    req.end();
  });
}

/**
 * Builds a Slack message payload for a stale pull request.
 * @param {object} pr - The pull request object from GitHub API.
 * @param {number} staleDays - How many days the PR has been inactive.
 * @returns {object} Slack message payload.
 */
function buildStalePRMessage(pr, staleDays) {
  const reviewers = pr.requested_reviewers
    ? pr.requested_reviewers.map((r) => `@${r.login}`).join(', ')
    : 'No reviewers assigned';

  return {
    text: `:warning: Stale Pull Request Detected`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `:warning: *Stale PR — ${staleDays} day${staleDays !== 1 ? 's' : ''} without activity*`,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*PR:*\n<${pr.html_url}|${pr.title}>`,
          },
          {
            type: 'mrkdwn',
            text: `*Author:*\n@${pr.user.login}`,
          },
          {
            type: 'mrkdwn',
            text: `*Reviewers:*\n${reviewers}`,
          },
          {
            type: 'mrkdwn',
            text: `*Last Updated:*\n${new Date(pr.updated_at).toDateString()}`,
          },
        ],
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'View Pull Request',
            },
            url: pr.html_url,
            style: 'primary',
          },
        ],
      },
    ],
  };
}

/**
 * Notifies Slack about a list of stale pull requests.
 * @param {string} webhookUrl - The Slack incoming webhook URL.
 * @param {Array<{pr: object, staleDays: number}>} stalePRs - List of stale PR entries.
 * @returns {Promise<void>}
 */
async function notifyStalePRs(webhookUrl, stalePRs) {
  if (!stalePRs || stalePRs.length === 0) {
    console.log('No stale PRs to notify about.');
    return;
  }

  for (const { pr, staleDays } of stalePRs) {
    const payload = buildStalePRMessage(pr, staleDays);
    try {
      await sendSlackMessage(webhookUrl, payload);
      console.log(`Notified Slack about stale PR: "${pr.title}"`);
    } catch (err) {
      console.error(`Failed to notify Slack for PR "${pr.title}": ${err.message}`);
    }
  }
}

module.exports = { sendSlackMessage, buildStalePRMessage, notifyStalePRs };
