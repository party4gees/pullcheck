/**
 * coverageNotifier.js
 * Builds Slack messages for PRs lacking reviewer coverage.
 */

const { annotateWithCoverage, filterUncoveredPRs } = require('./prReviewCoverageChecker');

/**
 * Formats a single uncovered PR into a Slack block line.
 * @param {object} pr
 * @returns {string}
 */
function formatUncoveredLine(pr) {
  const age = pr.age !== undefined ? ` — ${pr.age}d old` : '';
  return `• *<${pr.html_url}|#${pr.number} ${pr.title}>*${age} — no reviewer assigned`;
}

/**
 * Builds a Slack message summarising PRs with insufficient coverage.
 * @param {object[]} prs
 * @param {object} options
 * @param {number} [options.minApprovals=1]
 * @param {string} [options.repoName]
 * @returns {string|null} Slack message string or null if nothing to report
 */
function buildCoverageAlertMessage(prs, options = {}) {
  const { minApprovals = 1, repoName = 'repo' } = options;

  const uncovered = filterUncoveredPRs(prs);
  const annotated = annotateWithCoverage(prs, minApprovals);
  const unapproved = annotated.filter(
    pr => pr.coverage.hasReviewer && !pr.coverage.approved
  );

  if (uncovered.length === 0 && unapproved.length === 0) {
    return null;
  }

  const lines = [`:mag: *Review Coverage Alert — ${repoName}*`];

  if (uncovered.length > 0) {
    lines.push(`\n*No reviewer assigned (${uncovered.length}):*`);
    uncovered.forEach(pr => lines.push(formatUncoveredLine(pr)));
  }

  if (unapproved.length > 0) {
    lines.push(`\n*Awaiting approval (${unapproved.length}):*`);
    unapproved.forEach(pr => {
      lines.push(
        `• *<${pr.html_url}|#${pr.number} ${pr.title}>* — ${pr.coverage.approvalCount}/${minApprovals} approvals`
      );
    });
  }

  return lines.join('\n');
}

module.exports = { formatUncoveredLine, buildCoverageAlertMessage };
