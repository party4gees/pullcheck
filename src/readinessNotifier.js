/**
 * readinessNotifier.js
 * Formats Slack messages for PRs that are ready to merge
 * or still blocked, based on readiness checker annotations.
 */

/**
 * Format a single PR readiness line for Slack.
 * @param {object} pr - Annotated PR object with readiness info
 * @returns {string}
 */
function formatReadinessLine(pr) {
  const { number, title, html_url, readiness } = pr;
  if (!readiness) return `• <${html_url}|#${number}> ${title} — (no readiness data)`;

  if (readiness.ready) {
    return `✅ <${html_url}|#${number}> *${title}* — ready to merge`;
  }

  const blockerList = readiness.blockers.map(b => `\`${b}\``).join(', ');
  return `🔴 <${html_url}|#${number}> *${title}* — blocked by: ${blockerList}`;
}

/**
 * Filter PRs that are fully ready to merge.
 * @param {object[]} prs
 * @returns {object[]}
 */
function filterReadyToMerge(prs) {
  return prs.filter(pr => pr.readiness && pr.readiness.ready);
}

/**
 * Filter PRs that are blocked (not ready).
 * @param {object[]} prs
 * @returns {object[]}
 */
function filterStillBlocked(prs) {
  return prs.filter(pr => pr.readiness && !pr.readiness.ready);
}

/**
 * Build a Slack message summarising PR readiness across all annotated PRs.
 * Sections: ready to merge, still blocked.
 * @param {object[]} prs - PRs annotated with readiness info
 * @param {string} [repoName] - optional repo label for context
 * @returns {string}
 */
function buildReadinessMessage(prs, repoName) {
  const ready = filterReadyToMerge(prs);
  const blocked = filterStillBlocked(prs);

  if (ready.length === 0 && blocked.length === 0) {
    return repoName
      ? `No readiness data available for *${repoName}*.`
      : 'No readiness data available.';
  }

  const lines = [];
  const header = repoName
    ? `:white_check_mark: *PR Readiness Report — ${repoName}*`
    : ':white_check_mark: *PR Readiness Report*';
  lines.push(header);

  if (ready.length > 0) {
    lines.push(`\n*Ready to merge (${ready.length}):*`);
    ready.forEach(pr => lines.push(formatReadinessLine(pr)));
  }

  if (blocked.length > 0) {
    lines.push(`\n*Still blocked (${blocked.length}):*`);
    blocked.forEach(pr => lines.push(formatReadinessLine(pr)));
  }

  return lines.join('\n');
}

module.exports = {
  formatReadinessLine,
  filterReadyToMerge,
  filterStillBlocked,
  buildReadinessMessage,
};
