// labelSuggestionNotifier.js
// Formats Slack messages for PRs that have suggested labels not yet applied

/**
 * @param {object} pr - PR with suggestedLabels and existing labels array
 * @returns {string[]} labels that are suggested but not yet applied
 */
function getMissingLabels(pr) {
  const existing = new Set((pr.labels || []).map((l) => l.name || l));
  return (pr.suggestedLabels || []).filter((l) => !existing.has(l));
}

/**
 * Formats a single line entry for a PR with missing suggested labels.
 * @param {object} pr
 * @returns {string}
 */
function formatSuggestionLine(pr) {
  const missing = getMissingLabels(pr);
  if (missing.length === 0) return null;
  const labelList = missing.map((l) => `\`${l}\``).join(', ');
  return `• <${pr.html_url}|${pr.title}> — suggested: ${labelList}`;
}

/**
 * Builds a Slack message block listing PRs with unapplied label suggestions.
 * @param {object[]} prs - PRs annotated with suggestedLabels
 * @param {string} [repo] - optional repo name for context
 * @returns {string|null} formatted Slack message or null if nothing to report
 */
function buildLabelSuggestionMessage(prs, repo) {
  const lines = prs
    .map(formatSuggestionLine)
    .filter(Boolean);

  if (lines.length === 0) return null;

  const header = repo
    ? `:label: *Label Suggestions for ${repo}*`
    : `:label: *Label Suggestions*`;

  return [header, ...lines].join('\n');
}

module.exports = {
  getMissingLabels,
  formatSuggestionLine,
  buildLabelSuggestionMessage,
};
