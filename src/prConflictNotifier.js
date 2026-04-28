/**
 * prConflictNotifier.js
 * Builds Slack messages for PRs with merge conflicts or that are behind base.
 */

/**
 * @param {object} pr - Annotated PR with conflictStatus
 * @returns {string}
 */
function formatConflictLine(pr) {
  const { title, url, author, conflictStatus } = pr;
  const { hasConflict, isBehindBase } = conflictStatus || {};

  const tags = [];
  if (hasConflict) tags.push('⚠️ *merge conflict*');
  if (isBehindBase) tags.push('🔄 *behind base*');

  const tagStr = tags.length ? ` — ${tags.join(', ')}` : '';
  return `• <${url}|${title}> by *${author}*${tagStr}`;
}

/**
 * @param {object[]} prs - PRs that have conflicts or are behind base
 * @param {string} [repo]
 * @returns {string}
 */
function buildConflictAlertMessage(prs, repo = '') {
  if (!prs || prs.length === 0) return '';

  const header = repo
    ? `:rotating_light: *Conflict Alert — ${repo}*`
    : ':rotating_light: *Conflict Alert*';

  const lines = prs.map(formatConflictLine).join('\n');
  return `${header}\n${lines}\n_${prs.length} PR(s) need attention before they can merge._`;
}

module.exports = { formatConflictLine, buildConflictAlertMessage };
