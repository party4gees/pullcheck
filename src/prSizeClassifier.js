/**
 * prSizeClassifier.js
 * Classifies pull requests by size based on changed lines and files.
 */

const SIZE_THRESHOLDS = {
  xs: { lines: 10, files: 1 },
  small: { lines: 50, files: 5 },
  medium: { lines: 250, files: 10 },
  large: { lines: 1000, files: 25 },
};

/**
 * Returns the size label for a PR based on additions + deletions and changed files.
 * @param {object} pr
 * @returns {'xs'|'small'|'medium'|'large'|'xl'}
 */
function classifySize(pr) {
  const lines = (pr.additions || 0) + (pr.deletions || 0);
  const files = pr.changed_files || 0;

  if (lines <= SIZE_THRESHOLDS.xs.lines && files <= SIZE_THRESHOLDS.xs.files) return 'xs';
  if (lines <= SIZE_THRESHOLDS.small.lines && files <= SIZE_THRESHOLDS.small.files) return 'small';
  if (lines <= SIZE_THRESHOLDS.medium.lines && files <= SIZE_THRESHOLDS.medium.files) return 'medium';
  if (lines <= SIZE_THRESHOLDS.large.lines && files <= SIZE_THRESHOLDS.large.files) return 'large';
  return 'xl';
}

/**
 * Returns an emoji for the given size label.
 * @param {string} size
 * @returns {string}
 */
function sizeEmoji(size) {
  const map = { xs: '🟢', small: '🔵', medium: '🟡', large: '🟠', xl: '🔴' };
  return map[size] || '⚪';
}

/**
 * Annotates each PR with a `size` and `sizeEmoji` field.
 * @param {object[]} prs
 * @returns {object[]}
 */
function annotateWithSize(prs) {
  return prs.map((pr) => {
    const size = classifySize(pr);
    return { ...pr, size, sizeEmoji: sizeEmoji(size) };
  });
}

/**
 * Filters PRs to only those matching the given size label.
 * @param {object[]} prs
 * @param {string} size
 * @returns {object[]}
 */
function filterBySize(prs, size) {
  return prs.filter((pr) => classifySize(pr) === size);
}

module.exports = { classifySize, sizeEmoji, annotateWithSize, filterBySize };
