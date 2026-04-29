/**
 * prFirstResponseTracker.js
 * Tracks how long it takes for a PR to receive its first review activity.
 */

/**
 * Returns the number of hours between two ISO timestamps.
 */
function hoursBetween(start, end) {
  const ms = new Date(end) - new Date(start);
  return ms / (1000 * 60 * 60);
}

/**
 * Returns the timestamp of the first review event (comment, review, or approval),
 * or null if none exist.
 */
function firstResponseAt(pr) {
  const events = [
    ...(pr.reviewComments || []).map(c => c.createdAt),
    ...(pr.reviews || []).map(r => r.submittedAt),
  ].filter(Boolean);

  if (events.length === 0) return null;
  return events.sort()[0];
}

/**
 * Computes hours from PR creation to first response.
 * Returns null if no response has been recorded yet.
 */
function computeFirstResponseHours(pr) {
  const responseAt = firstResponseAt(pr);
  if (!responseAt) return null;
  return hoursBetween(pr.createdAt, responseAt);
}

/**
 * Classifies the first-response lag into a tier.
 */
function responseTier(hours) {
  if (hours === null) return 'none';
  if (hours <= 4) return 'fast';
  if (hours <= 24) return 'normal';
  if (hours <= 72) return 'slow';
  return 'critical';
}

/**
 * Annotates each PR with firstResponseHours and responseTier.
 */
function annotateWithFirstResponse(prs) {
  return prs.map(pr => {
    const firstResponseHours = computeFirstResponseHours(pr);
    return {
      ...pr,
      firstResponseHours,
      responseTier: responseTier(firstResponseHours),
    };
  });
}

/**
 * Filters PRs that have never received a response.
 */
function filterUnresponded(prs) {
  return prs.filter(pr => firstResponseAt(pr) === null);
}

module.exports = {
  hoursBetween,
  firstResponseAt,
  computeFirstResponseHours,
  responseTier,
  annotateWithFirstResponse,
  filterUnresponded,
};
