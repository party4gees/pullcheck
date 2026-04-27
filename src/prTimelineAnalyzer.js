/**
 * prTimelineAnalyzer.js
 * Analyzes the timeline of a PR to detect stalls, review gaps, and idle periods.
 */

/**
 * Returns the number of hours between two ISO date strings.
 */
function hoursBetween(dateA, dateB) {
  const a = new Date(dateA);
  const b = new Date(dateB);
  return Math.abs(b - a) / (1000 * 60 * 60);
}

/**
 * Detects the longest gap (in hours) between consecutive timeline events.
 * @param {string[]} eventTimestamps - Sorted array of ISO date strings
 * @returns {number}
 */
function longestGap(eventTimestamps) {
  if (!eventTimestamps || eventTimestamps.length < 2) return 0;
  let max = 0;
  for (let i = 1; i < eventTimestamps.length; i++) {
    const gap = hoursBetween(eventTimestamps[i - 1], eventTimestamps[i]);
    if (gap > max) max = gap;
  }
  return max;
}

/**
 * Determines whether a PR is stalled based on its timeline.
 * A PR is stalled if the longest gap exceeds the threshold (default 48h).
 * @param {string[]} eventTimestamps
 * @param {number} thresholdHours
 * @returns {boolean}
 */
function isStalled(eventTimestamps, thresholdHours = 48) {
  return longestGap(eventTimestamps) >= thresholdHours;
}

/**
 * Annotates a list of PRs with timeline analysis.
 * Each PR must have a `timeline` array of ISO date strings.
 * @param {object[]} prs
 * @param {number} thresholdHours
 * @returns {object[]}
 */
function annotateWithTimeline(prs, thresholdHours = 48) {
  return prs.map((pr) => {
    const timestamps = pr.timeline || [];
    const gap = longestGap(timestamps);
    return {
      ...pr,
      longestGapHours: Math.round(gap),
      isStalled: gap >= thresholdHours,
    };
  });
}

/**
 * Filters PRs that are considered stalled.
 * @param {object[]} prs
 * @param {number} thresholdHours
 * @returns {object[]}
 */
function filterStalledPRs(prs, thresholdHours = 48) {
  return annotateWithTimeline(prs, thresholdHours).filter((pr) => pr.isStalled);
}

module.exports = {
  hoursBetween,
  longestGap,
  isStalled,
  annotateWithTimeline,
  filterStalledPRs,
};
