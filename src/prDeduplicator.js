/**
 * prDeduplicator.js
 * Deduplicates PR notifications to avoid spamming Slack with repeated alerts.
 * Tracks which PRs have already been notified within a given time window.
 */

/**
 * Creates a deduplication key for a PR notification.
 * @param {Object} pr - PR object with number and repo fields
 * @param {string} notificationType - e.g. 'stale', 'reminder', 'escalation'
 * @returns {string}
 */
function makeDedupeKey(pr, notificationType) {
  const repo = pr.repo || pr.repository || 'unknown';
  return `${repo}#${pr.number}:${notificationType}`;
}

/**
 * Checks whether a PR notification has already been sent within the cooldown window.
 * @param {Object} sentLog - map of dedupeKey -> ISO timestamp of last send
 * @param {string} key - dedupe key
 * @param {number} cooldownHours - hours before the same notification can be re-sent
 * @param {Date} [now]
 * @returns {boolean}
 */
function isDuplicate(sentLog, key, cooldownHours, now = new Date()) {
  if (!sentLog[key]) return false;
  const lastSent = new Date(sentLog[key]);
  const diffMs = now - lastSent;
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours < cooldownHours;
}

/**
 * Records that a notification was sent for the given key.
 * @param {Object} sentLog - mutable log object
 * @param {string} key
 * @param {Date} [now]
 * @returns {Object} updated sentLog
 */
function recordSent(sentLog, key, now = new Date()) {
  return { ...sentLog, [key]: now.toISOString() };
}

/**
 * Filters a list of PR+type pairs, returning only those not yet deduped.
 * @param {Array<{pr: Object, type: string}>} notifications
 * @param {Object} sentLog
 * @param {number} cooldownHours
 * @param {Date} [now]
 * @returns {Array<{pr: Object, type: string}>}
 */
function filterDuplicates(notifications, sentLog, cooldownHours, now = new Date()) {
  return notifications.filter(({ pr, type }) => {
    const key = makeDedupeKey(pr, type);
    return !isDuplicate(sentLog, key, cooldownHours, now);
  });
}

/**
 * Removes entries from sentLog that are older than retentionHours.
 * @param {Object} sentLog
 * @param {number} retentionHours
 * @param {Date} [now]
 * @returns {Object} pruned sentLog
 */
function pruneSentLog(sentLog, retentionHours, now = new Date()) {
  return Object.fromEntries(
    Object.entries(sentLog).filter(([, timestamp]) => {
      const diffHours = (now - new Date(timestamp)) / (1000 * 60 * 60);
      return diffHours < retentionHours;
    })
  );
}

module.exports = {
  makeDedupeKey,
  isDuplicate,
  recordSent,
  filterDuplicates,
  pruneSentLog,
};
