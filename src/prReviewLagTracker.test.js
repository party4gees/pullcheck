const {
  hoursBetween,
  lagTier,
  annotateWithReviewLag,
  filterByReviewLag,
} = require('./prReviewLagTracker');

function hoursAgo(h) {
  return new Date(Date.now() - h * 36e5).toISOString();
}

function makePR(updatedHoursAgo, extra = {}) {
  return {
    number: Math.floor(Math.random() * 1000),
    title: 'Test PR',
    updated_at: hoursAgo(updatedHoursAgo),
    created_at: hoursAgo(updatedHoursAgo + 5),
    ...extra,
  };
}

describe('hoursBetween', () => {
  test('returns approximate hours between two timestamps', () => {
    const a = new Date(Date.now() - 5 * 36e5).toISOString();
    const b = new Date().toISOString();
    expect(hoursBetween(a, b)).toBeCloseTo(5, 0);
  });

  test('is symmetric', () => {
    const a = new Date(Date.now() - 10 * 36e5).toISOString();
    const b = new Date().toISOString();
    expect(hoursBetween(a, b)).toBeCloseTo(hoursBetween(b, a), 0);
  });
});

describe('lagTier', () => {
  test('low for under 24h', () => expect(lagTier(12)).toBe('low'));
  test('medium for 24-72h', () => expect(lagTier(48)).toBe('medium'));
  test('high for 72-168h', () => expect(lagTier(100)).toBe('high'));
  test('critical for 168h+', () => expect(lagTier(200)).toBe('critical'));
  test('boundary: exactly 24h is medium', () => expect(lagTier(24)).toBe('medium'));
  test('boundary: exactly 168h is critical', () => expect(lagTier(168)).toBe('critical'));
});

describe('annotateWithReviewLag', () => {
  test('adds reviewLagHours and reviewLagTier to each PR', () => {
    const prs = [makePR(10), makePR(50), makePR(200)];
    const result = annotateWithReviewLag(prs);
    expect(result[0].reviewLagHours).toBeGreaterThanOrEqual(9);
    expect(result[0].reviewLagTier).toBe('low');
    expect(result[1].reviewLagTier).toBe('medium');
    expect(result[2].reviewLagTier).toBe('critical');
  });

  test('does not mutate original PR objects', () => {
    const pr = makePR(30);
    annotateWithReviewLag([pr]);
    expect(pr.reviewLagHours).toBeUndefined();
  });

  test('returns empty array for empty input', () => {
    expect(annotateWithReviewLag([])).toEqual([]);
  });
});

describe('filterByReviewLag', () => {
  test('filters PRs below threshold', () => {
    const prs = annotateWithReviewLag([makePR(10), makePR(60), makePR(200)]);
    const result = filterByReviewLag(prs, 48);
    expect(result.length).toBe(2);
    result.forEach((pr) => expect(pr.reviewLagHours).toBeGreaterThanOrEqual(48));
  });

  test('returns all when threshold is 0', () => {
    const prs = annotateWithReviewLag([makePR(1), makePR(5)]);
    expect(filterByReviewLag(prs, 0).length).toBe(2);
  });

  test('returns empty when all below threshold', () => {
    const prs = annotateWithReviewLag([makePR(2)]);
    expect(filterByReviewLag(prs, 100)).toHaveLength(0);
  });
});
