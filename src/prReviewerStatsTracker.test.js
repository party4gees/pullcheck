const {
  buildReviewerStats,
  rankReviewersByLag,
  filterSlowReviewers,
} = require('./prReviewerStatsTracker');

function makePR(overrides = {}) {
  return {
    number: 1,
    title: 'Test PR',
    reviewers: ['alice'],
    approvedBy: [],
    reviewLagHours: 10,
    ...overrides,
  };
}

describe('buildReviewerStats', () => {
  test('counts assigned PRs per reviewer', () => {
    const prs = [
      makePR({ reviewers: ['alice'], reviewLagHours: 20 }),
      makePR({ reviewers: ['alice', 'bob'], reviewLagHours: 40 }),
    ];
    const stats = buildReviewerStats(prs);
    expect(stats.get('alice').assigned).toBe(2);
    expect(stats.get('bob').assigned).toBe(1);
  });

  test('counts reviewed PRs when reviewer is in approvedBy', () => {
    const prs = [
      makePR({ reviewers: ['alice'], approvedBy: ['alice'], reviewLagHours: 10 }),
      makePR({ reviewers: ['alice'], approvedBy: [], reviewLagHours: 10 }),
    ];
    const stats = buildReviewerStats(prs);
    expect(stats.get('alice').reviewed).toBe(1);
  });

  test('computes avgLagHours correctly', () => {
    const prs = [
      makePR({ reviewers: ['alice'], reviewLagHours: 20 }),
      makePR({ reviewers: ['alice'], reviewLagHours: 60 }),
    ];
    const stats = buildReviewerStats(prs);
    expect(stats.get('alice').avgLagHours).toBe(40);
  });

  test('handles null reviewLagHours gracefully', () => {
    const prs = [makePR({ reviewers: ['bob'], reviewLagHours: null })];
    const stats = buildReviewerStats(prs);
    expect(stats.get('bob').avgLagHours).toBe(0);
  });

  test('returns empty map for empty input', () => {
    expect(buildReviewerStats([]).size).toBe(0);
  });
});

describe('rankReviewersByLag', () => {
  test('sorts reviewers slowest first', () => {
    const prs = [
      makePR({ reviewers: ['alice'], reviewLagHours: 10 }),
      makePR({ reviewers: ['bob'], reviewLagHours: 80 }),
      makePR({ reviewers: ['carol'], reviewLagHours: 40 }),
    ];
    const stats = buildReviewerStats(prs);
    const ranked = rankReviewersByLag(stats);
    expect(ranked[0].reviewer).toBe('bob');
    expect(ranked[1].reviewer).toBe('carol');
    expect(ranked[2].reviewer).toBe('alice');
  });
});

describe('filterSlowReviewers', () => {
  test('filters out reviewers below threshold', () => {
    const prs = [
      makePR({ reviewers: ['alice'], reviewLagHours: 10 }),
      makePR({ reviewers: ['bob'], reviewLagHours: 100 }),
    ];
    const stats = buildReviewerStats(prs);
    const slow = filterSlowReviewers(stats, 48);
    expect(slow.map(r => r.reviewer)).toEqual(['bob']);
  });

  test('returns empty array when no one is slow', () => {
    const prs = [makePR({ reviewers: ['alice'], reviewLagHours: 5 })];
    const stats = buildReviewerStats(prs);
    expect(filterSlowReviewers(stats, 48)).toEqual([]);
  });
});
