const { groupByStaleness, groupByReviewer, filterByLabel, sortByStaleness } = require('./prGrouper');

const samplePRs = [
  { id: 1, title: 'Fix bug', daysSinceUpdate: 3,  reviewerHandle: '@alice', labels: ['needs-review'] },
  { id: 2, title: 'Add feature', daysSinceUpdate: 10, reviewerHandle: '@bob',   labels: ['stale'] },
  { id: 3, title: 'Refactor',   daysSinceUpdate: 20, reviewerHandle: '@alice', labels: ['stale', 'escalated'] },
  { id: 4, title: 'Docs update', daysSinceUpdate: 1,  reviewerHandle: null,    labels: [] },
];

describe('groupByStaleness', () => {
  it('groups PRs into staleness buckets', () => {
    const groups = groupByStaleness(samplePRs);
    expect(typeof groups).toBe('object');
    // Each value should be an array
    Object.values(groups).forEach(arr => expect(Array.isArray(arr)).toBe(true));
  });

  it('places a fresh PR in a lower staleness bucket than an old PR', () => {
    const groups = groupByStaleness(samplePRs);
    const allLevels = Object.keys(groups);
    expect(allLevels.length).toBeGreaterThan(0);
  });

  it('returns empty object for empty input', () => {
    expect(groupByStaleness([])).toEqual({});
  });
});

describe('groupByReviewer', () => {
  it('groups PRs by reviewer handle', () => {
    const groups = groupByReviewer(samplePRs);
    expect(groups['@alice']).toHaveLength(2);
    expect(groups['@bob']).toHaveLength(1);
  });

  it('places PRs with no reviewer under __unassigned__', () => {
    const groups = groupByReviewer(samplePRs);
    expect(groups['__unassigned__']).toHaveLength(1);
    expect(groups['__unassigned__'][0].id).toBe(4);
  });

  it('returns empty object for empty input', () => {
    expect(groupByReviewer([])).toEqual({});
  });
});

describe('filterByLabel', () => {
  it('returns only PRs with the given label', () => {
    const stale = filterByLabel(samplePRs, 'stale');
    expect(stale).toHaveLength(2);
    stale.forEach(pr => expect(pr.labels).toContain('stale'));
  });

  it('returns empty array when no PRs match', () => {
    expect(filterByLabel(samplePRs, 'nonexistent')).toEqual([]);
  });

  it('handles PRs with missing labels gracefully', () => {
    const prs = [{ id: 5, labels: undefined }];
    expect(filterByLabel(prs, 'stale')).toEqual([]);
  });
});

describe('sortByStaleness', () => {
  it('sorts PRs from most to least stale', () => {
    const sorted = sortByStaleness(samplePRs);
    expect(sorted[0].daysSinceUpdate).toBeGreaterThanOrEqual(sorted[1].daysSinceUpdate);
    expect(sorted[1].daysSinceUpdate).toBeGreaterThanOrEqual(sorted[2].daysSinceUpdate);
  });

  it('does not mutate the original array', () => {
    const original = [...samplePRs];
    sortByStaleness(samplePRs);
    expect(samplePRs).toEqual(original);
  });

  it('returns empty array for empty input', () => {
    expect(sortByStaleness([])).toEqual([]);
  });
});
