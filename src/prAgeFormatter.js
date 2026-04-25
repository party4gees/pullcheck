/**
 * prAgeFormatter.js
 * Formats PR age and staleness metadata into human-readable strings.
 */

/**
 * Returns a human-readable age string from a number of days.
 * @param {number} days
 * @returns {string}
 */
function formatAge(days) {
  if (days < 1) return 'less than a day';
  if (days === 1) return '1 day';
  if (days < 7) return `${days} days`;
  const weeks = Math.floor(days / 7);
  const remainder = days % 7;
  const weekLabel = weeks === 1 ? '1 week' : `${weeks} weeks`;
  if (remainder === 0) return weekLabel;
  const dayLabel = remainder === 1 ? '1 day' : `${remainder} days`;
  return `${weekLabel}, ${dayLabel}`;
}

/**
 * Returns a staleness tier label based on days since last activity.
 * @param {number} days
 * @param {object} thresholds - { warn: number, critical: number }
 * @returns {'fresh'|'warn'|'critical'}
 */
function getStalenessLevel(days, thresholds = { warn: 3, critical: 7 }) {
  if (days >= thresholds.critical) return 'critical';
  if (days >= thresholds.warn) return 'warn';
  return 'fresh';
}

/**
 * Returns an emoji indicator for a given staleness level.
 * @param {'fresh'|'warn'|'critical'} level
 * @returns {string}
 */
function stalenessEmoji(level) {
  const map = {
    fresh: '🟢',
    warn: '🟡',
    critical: '🔴',
  };
  return map[level] ?? '⚪';
}

/**
 * Builds a formatted staleness summary string for a PR.
 * @param {object} pr - { title, number, updatedAt }
 * @param {number} days
 * @param {object} [thresholds]
 * @returns {string}
 */
function formatPRAgeSummary(pr, days, thresholds) {
  const level = getStalenessLevel(days, thresholds);
  const emoji = stalenessEmoji(level);
  const age = formatAge(days);
  return `${emoji} *#${pr.number}* — ${pr.title} (idle for ${age})`;
}

module.exports = { formatAge, getStalenessLevel, stalenessEmoji, formatPRAgeSummary };
