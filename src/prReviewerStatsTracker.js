// prReviewerStatsTracker.js
// Aggregates reviewer-level stats across a set of annotated PRs

/**
 * @param {object[]} prs - PRs annotated with reviewers and lag info
 * @returns {Map<string, { assigned: number, reviewed: number, avgLagHours: number }>}
 */
function buildReviewerStats(prs) {
  const stats = new Map();

  for (const pr of prs) {
    const reviewers = pr.reviewers || [];
    const lagHours = pr.reviewLagHours ?? null;

    for (const reviewer of reviewers) {
      if (!stats.has(reviewer)) {
        stats.set(reviewer, { assigned: 0, reviewed: 0, totalLagHours: 0, lagCount: 0 });
      }
      const entry = stats.get(reviewer);
      entry.assigned += 1;
      if (pr.approvedBy && pr.approvedBy.includes(reviewer)) {
        entry.reviewed += 1;
      }
      if (lagHours !== null) {
        entry.totalLagHours += lagHours;
        entry.lagCount += 1;
      }
    }
  }

  const result = new Map();
  for (const [reviewer, data] of stats) {
    result.set(reviewer, {
      assigned: data.assigned,
      reviewed: data.reviewed,
      avgLagHours: data.lagCount > 0 ? Math.round(data.totalLagHours / data.lagCount) : 0,
    });
  }
  return result;
}

/**
 * Returns reviewers sorted by avgLagHours descending (slowest first).
 * @param {Map} statsMap
 * @returns {Array<{ reviewer: string, stats: object }>}
 */
function rankReviewersByLag(statsMap) {
  return Array.from(statsMap.entries())
    .map(([reviewer, stats]) => ({ reviewer, stats }))
    .sort((a, b) => b.stats.avgLagHours - a.stats.avgLagHours);
}

/**
 * Returns reviewers with avgLagHours above the given threshold.
 * @param {Map} statsMap
 * @param {number} minAvgHours
 * @returns {Array<{ reviewer: string, stats: object }>}
 */
function filterSlowReviewers(statsMap, minAvgHours = 48) {
  return rankReviewersByLag(statsMap).filter(
    ({ stats }) => stats.avgLagHours >= minAvgHours
  );
}

module.exports = { buildReviewerStats, rankReviewersByLag, filterSlowReviewers };
