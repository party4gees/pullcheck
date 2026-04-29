/**
 * prCycleTimeTracker.js
 * Tracks time from PR open to merge/close and computes cycle time metrics.
 */

/**
 * Returns hours between two ISO timestamp strings.
 */
function hoursBetween(start, end) {
  const ms = new Date(end) - new Date(start);
  return ms / (1000 * 60 * 60);
}

/**
 * Computes cycle time in hours for a single PR.
 * Uses closedAt or mergedAt if available, otherwise uses now.
 */
function computeCycleTime(pr) {
  const start = pr.createdAt;
  const end = pr.mergedAt || pr.closedAt || new Date().toISOString();
  return parseFloat(hoursBetween(start, end).toFixed(2));
}

/**
 * Classifies cycle time into a tier label.
 */
function cycleTier(hours) {
  if (hours <= 24) return 'fast';
  if (hours <= 72) return 'normal';
  if (hours <= 168) return 'slow';
  return 'stalled';
}

/**
 * Annotates each PR with cycleTimeHours and cycleTier.
 */
function annotateWithCycleTime(prs) {
  return prs.map((pr) => {
    const cycleTimeHours = computeCycleTime(pr);
    return { ...pr, cycleTimeHours, cycleTier: cycleTier(cycleTimeHours) };
  });
}

/**
 * Returns average cycle time in hours across all PRs.
 */
function averageCycleTime(prs) {
  if (!prs.length) return 0;
  const total = prs.reduce((sum, pr) => sum + computeCycleTime(pr), 0);
  return parseFloat((total / prs.length).toFixed(2));
}

/**
 * Filters PRs whose cycle time exceeds thresholdHours.
 */
function filterSlowPRs(prs, thresholdHours = 72) {
  return prs.filter((pr) => computeCycleTime(pr) > thresholdHours);
}

module.exports = {
  hoursBetween,
  computeCycleTime,
  cycleTier,
  annotateWithCycleTime,
  averageCycleTime,
  filterSlowPRs,
};
