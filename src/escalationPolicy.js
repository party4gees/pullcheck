/**
 * escalationPolicy.js
 * Determines whether a stale PR should be escalated to a higher-tier reviewer
 * based on how long it has been waiting and configured thresholds.
 */

const DEFAULT_ESCALATION_DAYS = 5;
const DEFAULT_ESCALATION_LABEL = 'needs-escalation';

/**
 * Returns true if the PR has been stale long enough to warrant escalation.
 * @param {number} staleDays - How many days the PR has been stale
 * @param {object} config - The loaded pullcheck config
 * @returns {boolean}
 */
function shouldEscalate(staleDays, config = {}) {
  const threshold = config.escalationDays ?? DEFAULT_ESCALATION_DAYS;
  return staleDays >= threshold;
}

/**
 * Resolves the escalation target (e.g. a team lead or fallback reviewer).
 * Falls back to a default if none is configured.
 * @param {string} reviewer - Original reviewer GitHub login
 * @param {object} escalationMap - Map of reviewer -> escalation contact
 * @returns {string|null}
 */
function resolveEscalationTarget(reviewer, escalationMap = {}) {
  if (!reviewer) return null;
  return escalationMap[reviewer] ?? null;
}

/**
 * Builds an escalation context object for a given PR.
 * @param {object} pr - PR data object
 * @param {number} staleDays
 * @param {object} config
 * @param {object} escalationMap
 * @returns {object}
 */
function buildEscalationContext(pr, staleDays, config = {}, escalationMap = {}) {
  const label = config.escalationLabel ?? DEFAULT_ESCALATION_LABEL;
  const eligible = shouldEscalate(staleDays, config);
  const targets = (pr.reviewers ?? []).map(r => resolveEscalationTarget(r, escalationMap)).filter(Boolean);

  return {
    prNumber: pr.number,
    prTitle: pr.title,
    staleDays,
    eligible,
    targets,
    label,
  };
}

module.exports = { shouldEscalate, resolveEscalationTarget, buildEscalationContext, DEFAULT_ESCALATION_DAYS, DEFAULT_ESCALATION_LABEL };
