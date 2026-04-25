/**
 * reminderScheduler.js
 * Determines which stale PRs should trigger a reminder based on
 * escalation intervals defined in config.
 */

/**
 * Returns true if a reminder should be sent for this PR given
 * how many days it has been stale and the configured intervals.
 *
 * @param {number} daysStale - Number of days the PR has been stale
 * @param {number[]} intervals - Sorted ascending reminder intervals (e.g. [1, 3, 7])
 * @returns {boolean}
 */
function shouldSendReminder(daysStale, intervals) {
  if (!Array.isArray(intervals) || intervals.length === 0) return false;
  return intervals.includes(daysStale);
}

/**
 * Filters a list of stale PR objects down to those that are due
 * for a reminder today.
 *
 * @param {Array<{ number: number, daysStale: number }>} stalePRs
 * @param {number[]} intervals - Reminder intervals in days
 * @returns {Array}
 */
function filterDueReminders(stalePRs, intervals) {
  if (!Array.isArray(stalePRs)) return [];
  return stalePRs.filter((pr) => shouldSendReminder(pr.daysStale, intervals));
}

/**
 * Builds a schedule label for a PR, e.g. "Day 3 reminder".
 *
 * @param {number} daysStale
 * @param {number[]} intervals
 * @returns {string}
 */
function getReminderLabel(daysStale, intervals) {
  const index = intervals.indexOf(daysStale);
  if (index === -1) return 'No reminder';
  return `Day ${daysStale} reminder (escalation ${index + 1} of ${intervals.length})`;
}

module.exports = { shouldSendReminder, filterDueReminders, getReminderLabel };
