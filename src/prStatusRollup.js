/**
 * prStatusRollup.js
 * Aggregates PR status checks (CI, reviews, conflicts) into a single rollup summary.
 */

/**
 * @param {object} pr - PR object with statusChecks, approvals, mergeable fields
 * @returns {'green'|'yellow'|'red'} overall rollup status
 */
function rollupStatus(pr) {
  const checks = pr.statusChecks || [];
  const hasFailing = checks.some(c => c.state === 'failure' || c.state === 'error');
  const hasPending = checks.some(c => c.state === 'pending');

  if (hasFailing || pr.mergeable === false) return 'red';
  if (hasPending || (pr.approvals || 0) === 0) return 'yellow';
  return 'green';
}

/**
 * @param {'green'|'yellow'|'red'} status
 * @returns {string} emoji representing the status
 */
function statusEmoji(status) {
  const map = { green: '✅', yellow: '⏳', red: '🚨' };
  return map[status] || '❓';
}

/**
 * Annotates each PR with a rollup status and emoji.
 * @param {object[]} prs
 * @returns {object[]}
 */
function annotateWithRollup(prs) {
  return prs.map(pr => {
    const status = rollupStatus(pr);
    return { ...pr, rollupStatus: status, rollupEmoji: statusEmoji(status) };
  });
}

/**
 * Builds a compact rollup summary line for a single PR.
 * @param {object} pr - annotated PR
 * @returns {string}
 */
function formatRollupLine(pr) {
  const checks = (pr.statusChecks || []).length;
  const approvals = pr.approvals || 0;
  const conflict = pr.mergeable === false ? ' ⚠️ conflict' : '';
  return `${pr.rollupEmoji} *<${pr.url}|${pr.title}>* — ${approvals} approval(s), ${checks} check(s)${conflict}`;
}

/**
 * Builds the full rollup message for a list of PRs.
 * @param {object[]} prs - raw PRs
 * @returns {string}
 */
function buildRollupMessage(prs) {
  if (!prs || prs.length === 0) return '_No PRs to report._';
  const annotated = annotateWithRollup(prs);
  const lines = annotated.map(formatRollupLine);
  return `*PR Status Rollup* (${prs.length} PR${prs.length !== 1 ? 's' : ''})\n${lines.join('\n')}`;
}

module.exports = { rollupStatus, statusEmoji, annotateWithRollup, formatRollupLine, buildRollupMessage };
