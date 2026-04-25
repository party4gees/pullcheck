/**
 * labelManager.js
 * Manages GitHub PR labels for stale/reminder tracking.
 */

const STALE_LABEL = 'stale';
const AWAITING_REVIEW_LABEL = 'awaiting-review';
const REMINDER_SENT_LABEL = 'reminder-sent';

/**
 * Returns the set of tracking labels used by pullcheck.
 */
function getTrackingLabels() {
  return [STALE_LABEL, AWAITING_REVIEW_LABEL, REMINDER_SENT_LABEL];
}

/**
 * Determines which labels should be applied to a PR based on its state.
 * @param {object} pr - PR object with daysSinceUpdate and reviewRequested fields
 * @param {object} config - pullcheck config
 * @returns {string[]} labels to apply
 */
function resolveLabelsForPR(pr, config) {
  const labels = [];
  const staleThreshold = config.staleDays ?? 7;

  if (pr.daysSinceUpdate >= staleThreshold) {
    labels.push(STALE_LABEL);
  }

  if (pr.reviewRequested && pr.daysSinceUpdate < staleThreshold) {
    labels.push(AWAITING_REVIEW_LABEL);
  }

  if (pr.reminderSent) {
    labels.push(REMINDER_SENT_LABEL);
  }

  return labels;
}

/**
 * Returns labels that need to be added or removed given current and desired state.
 * @param {string[]} currentLabels
 * @param {string[]} desiredLabels
 * @returns {{ toAdd: string[], toRemove: string[] }}
 */
function diffLabels(currentLabels, desiredLabels) {
  const tracking = getTrackingLabels();
  const toAdd = desiredLabels.filter(l => !currentLabels.includes(l));
  const toRemove = tracking.filter(
    l => currentLabels.includes(l) && !desiredLabels.includes(l)
  );
  return { toAdd, toRemove };
}

module.exports = {
  getTrackingLabels,
  resolveLabelsForPR,
  diffLabels,
  STALE_LABEL,
  AWAITING_REVIEW_LABEL,
  REMINDER_SENT_LABEL,
};
