/**
 * prSnoozeManager.js
 * Manages snooze state for pull requests — suppresses notifications
 * until a snooze period has expired.
 */

const DEFAULT_SNOOZE_DAYS = 2;

/**
 * Returns the snooze expiry timestamp for a PR given a duration in days.
 * @param {string} prId - Unique PR identifier (e.g. "owner/repo#42")
 * @param {number} days - Number of days to snooze
 * @param {Date} [now] - Optional reference date (defaults to current time)
 * @returns {{ prId: string, expiresAt: string }}
 */
function createSnooze(prId, days = DEFAULT_SNOOZE_DAYS, now = new Date()) {
  if (!prId || typeof prId !== 'string') {
    throw new Error('createSnooze: prId must be a non-empty string');
  }
  if (typeof days !== 'number' || days <= 0 || !Number.isFinite(days)) {
    throw new Error('createSnooze: days must be a positive finite number');
  }
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + days);
  return { prId, expiresAt: expiresAt.toISOString() };
}

/**
 * Checks whether a snooze entry is still active.
 * @param {{ expiresAt: string }} snoozeEntry
 * @param {Date} [now]
 * @returns {boolean}
 */
function isSnoozed(snoozeEntry, now = new Date()) {
  if (!snoozeEntry || !snoozeEntry.expiresAt) return false;
  return new Date(snoozeEntry.expiresAt) > now;
}

/**
 * Filters a list of PRs, removing any that are currently snoozed.
 * @param {Array<{ id: string }>} prs
 * @param {Record<string, { expiresAt: string }>} snoozeMap - keyed by prId
 * @param {Date} [now]
 * @returns {Array<{ id: string }>}
 */
function filterSnoozed(prs, snoozeMap = {}, now = new Date()) {
  return prs.filter((pr) => {
    const entry = snoozeMap[pr.id];
    return !isSnoozed(entry, now);
  });
}

/**
 * Removes expired snooze entries from a snooze map.
 * @param {Record<string, { expiresAt: string }>} snoozeMap
 * @param {Date} [now]
 * @returns {Record<string, { expiresAt: string }>}
 */
function purgeExpiredSnoozes(snoozeMap = {}, now = new Date()) {
  return Object.fromEntries(
    Object.entries(snoozeMap).filter(([, entry]) => isSnoozed(entry, now))
  );
}

module.exports = {
  createSnooze,
  isSnoozed,
  filterSnoozed,
  purgeExpiredSnoozes,
  DEFAULT_SNOOZE_DAYS,
};
