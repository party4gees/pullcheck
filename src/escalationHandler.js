/**
 * escalationHandler.js
 * Orchestrates escalation: detects eligible PRs, applies labels,
 * and sends Slack notifications to escalation targets.
 */

const { buildEscalationContext } = require('./escalationPolicy');
const { buildStalePRMessage } = require('./slackNotifier');

/**
 * Processes a list of stale PRs and returns escalation actions.
 * @param {Array} stalePRs - Array of { pr, staleDays } objects
 * @param {object} config - Loaded pullcheck config
 * @param {object} escalationMap - reviewer -> escalation target map
 * @returns {Array} escalation actions with context + slack message
 */
function processEscalations(stalePRs, config = {}, escalationMap = {}) {
  const actions = [];

  for (const { pr, staleDays } of stalePRs) {
    const ctx = buildEscalationContext(pr, staleDays, config, escalationMap);
    if (!ctx.eligible || ctx.targets.length === 0) continue;

    const message = buildEscalationSlackMessage(ctx);
    actions.push({ ctx, message });
  }

  return actions;
}

/**
 * Builds a Slack message string for an escalation event.
 * @param {object} ctx - Escalation context from buildEscalationContext
 * @returns {string}
 */
function buildEscalationSlackMessage(ctx) {
  const mentions = ctx.targets.map(t => `@${t}`).join(', ');
  return (
    `:rotating_light: *Escalation Alert* — PR #${ctx.prNumber}: _${ctx.prTitle}_\n` +
    `This PR has been stale for *${ctx.staleDays} days* and needs attention.\n` +
    `Pinging escalation contacts: ${mentions}`
  );
}

/**
 * Extracts the escalation label from eligible escalation contexts.
 * @param {Array} actions - Output of processEscalations
 * @returns {string[]}
 */
function collectEscalationLabels(actions) {
  return [...new Set(actions.map(a => a.ctx.label))];
}

module.exports = { processEscalations, buildEscalationSlackMessage, collectEscalationLabels };
