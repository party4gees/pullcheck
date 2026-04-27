/**
 * prLabelSuggester.js
 * Suggests labels for PRs based on size, staleness, draft status, and activity score.
 */

const { classifySize } = require('./prSizeClassifier');
const { getStalenessLevel } = require('./prAgeFormatter');

const LABEL_MAP = {
  size: {
    xs: 'size/xs',
    small: 'size/small',
    medium: 'size/medium',
    large: 'size/large',
    xl: 'size/xl',
  },
  staleness: {
    fresh: null,
    aging: 'staleness/aging',
    stale: 'staleness/stale',
    critical: 'staleness/critical',
  },
};

/**
 * Suggest labels for a single PR based on its properties.
 * @param {object} pr
 * @param {number} [stalenessThreshold=7] - days before considered aging
 * @returns {string[]}
 */
function suggestLabels(pr, stalenessThreshold = 7) {
  const suggestions = [];

  const size = classifySize(pr);
  const sizeLabel = LABEL_MAP.size[size];
  if (sizeLabel) suggestions.push(sizeLabel);

  const days = pr.staleDays ?? 0;
  const level = getStalenessLevel(days, stalenessThreshold);
  const stalenessLabel = LABEL_MAP.staleness[level];
  if (stalenessLabel) suggestions.push(stalenessLabel);

  if (pr.draft) suggestions.push('status/draft');

  if (pr.activityScore !== undefined && pr.activityScore < 2) {
    suggestions.push('needs-attention');
  }

  return suggestions;
}

/**
 * Annotate an array of PRs with a `suggestedLabels` field.
 * @param {object[]} prs
 * @param {number} [stalenessThreshold]
 * @returns {object[]}
 */
function annotateWithSuggestedLabels(prs, stalenessThreshold) {
  return prs.map(pr => ({
    ...pr,
    suggestedLabels: suggestLabels(pr, stalenessThreshold),
  }));
}

/**
 * Return only PRs that have at least one suggested label.
 * @param {object[]} prs
 * @param {number} [stalenessThreshold]
 * @returns {object[]}
 */
function filterWithSuggestions(prs, stalenessThreshold) {
  return annotateWithSuggestedLabels(prs, stalenessThreshold).filter(
    pr => pr.suggestedLabels.length > 0
  );
}

module.exports = { suggestLabels, annotateWithSuggestedLabels, filterWithSuggestions };
