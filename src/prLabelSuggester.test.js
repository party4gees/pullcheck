const {
  suggestLabels,
  annotateWithSuggestedLabels,
  filterWithSuggestions,
} = require('./prLabelSuggester');

function makePR(overrides = {}) {
  return {
    title: 'Test PR',
    additions: 10,
    deletions: 5,
    changedFiles: 2,
    staleDays: 0,
    draft: false,
    activityScore: 5,
    ...overrides,
  };
}

describe('suggestLabels', () => {
  test('suggests size label for a small PR', () => {
    const pr = makePR({ additions: 10, deletions: 5, changedFiles: 2 });
    const labels = suggestLabels(pr);
    expect(labels).toContain('size/small');
  });

  test('suggests size/xl for a very large PR', () => {
    const pr = makePR({ additions: 800, deletions: 200, changedFiles: 40 });
    const labels = suggestLabels(pr);
    expect(labels).toContain('size/xl');
  });

  test('suggests staleness/stale for old PR', () => {
    const pr = makePR({ staleDays: 14 });
    const labels = suggestLabels(pr, 7);
    expect(labels.some(l => l.startsWith('staleness/'))).toBe(true);
  });

  test('does not suggest staleness label for fresh PR', () => {
    const pr = makePR({ staleDays: 1 });
    const labels = suggestLabels(pr, 7);
    expect(labels.some(l => l.startsWith('staleness/'))).toBe(false);
  });

  test('suggests status/draft for draft PRs', () => {
    const pr = makePR({ draft: true });
    const labels = suggestLabels(pr);
    expect(labels).toContain('status/draft');
  });

  test('suggests needs-attention for low activity score', () => {
    const pr = makePR({ activityScore: 1 });
    const labels = suggestLabels(pr);
    expect(labels).toContain('needs-attention');
  });

  test('does not suggest needs-attention for active PR', () => {
    const pr = makePR({ activityScore: 8 });
    const labels = suggestLabels(pr);
    expect(labels).not.toContain('needs-attention');
  });

  test('returns empty array for a fresh, small, active, non-draft PR', () => {
    const pr = makePR({ additions: 5, deletions: 2, changedFiles: 1, staleDays: 0, activityScore: 9 });
    const labels = suggestLabels(pr, 7);
    expect(labels.some(l => l.startsWith('staleness/'))).toBe(false);
    expect(labels).not.toContain('status/draft');
    expect(labels).not.toContain('needs-attention');
  });
});

describe('annotateWithSuggestedLabels', () => {
  test('annotates each PR with suggestedLabels array', () => {
    const prs = [makePR({ draft: true }), makePR({ staleDays: 20 })];
    const result = annotateWithSuggestedLabels(prs, 7);
    expect(result[0]).toHaveProperty('suggestedLabels');
    expect(result[0].suggestedLabels).toContain('status/draft');
    expect(result[1].suggestedLabels.some(l => l.startsWith('staleness/'))).toBe(true);
  });
});

describe('filterWithSuggestions', () => {
  test('returns only PRs with at least one suggestion', () => {
    const prs = [
      makePR({ additions: 5, deletions: 1, changedFiles: 1, staleDays: 0, activityScore: 9 }),
      makePR({ draft: true }),
    ];
    const result = filterWithSuggestions(prs, 7);
    expect(result.length).toBe(1);
    expect(result[0].suggestedLabels).toContain('status/draft');
  });
});
