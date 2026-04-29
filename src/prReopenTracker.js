/**
 * prReopenTracker.js
 * Detects PRs that have been closed and reopened, flagging potentially
 * troubled or indecisive PRs for extra attention.
 */

/**
 * Returns the number of times a PR has been reopened based on its timeline events.
 * @param {Array} events - Array of timeline event objects with { event, created_at }
 * @returns {number}
 */
function countReopens(events = []) {
  return events.filter(e => e.event === 'reopened').length;
}

/**
 * Returns the most recent reopened timestamp, or null if never reopened.
 * @param {Array} events
 * @returns {string|null}
 */
function lastReopenedAt(events = []) {
  const reopens = events
    .filter(e => e.event === 'reopened')
    .map(e => e.created_at)
    .sort();
  return reopens.length > 0 ? reopens[reopens.length - 1] : null;
}

/**
 * Annotates each PR with reopen count and last reopen timestamp.
 * @param {Array} prs - Each PR should have a `timelineEvents` array
 * @returns {Array}
 */
function annotateWithReopenInfo(prs) {
  return prs.map(pr => ({
    ...pr,
    reopenCount: countReopens(pr.timelineEvents),
    lastReopenedAt: lastReopenedAt(pr.timelineEvents),
  }));
}

/**
 * Filters PRs that have been reopened at least `minReopens` times.
 * @param {Array} prs - Already annotated with reopenCount
 * @param {number} minReopens
 * @returns {Array}
 */
function filterReopenedPRs(prs, minReopens = 1) {
  return prs.filter(pr => (pr.reopenCount ?? 0) >= minReopens);
}

module.exports = {
  countReopens,
  lastReopenedAt,
  annotateWithReopenInfo,
  filterReopenedPRs,
};
