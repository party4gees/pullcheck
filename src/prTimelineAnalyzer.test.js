const {
  hoursBetween,
  longestGap,
  isStalled,
  annotateWithTimeline,
  filterStalledPRs,
} = require('./prTimelineAnalyzer');

function ts(hoursAgo) {
  return new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();
}

describe('hoursBetween', () => {
  it('returns 0 for identical timestamps', () => {
    const t = new Date().toISOString();
    expect(hoursBetween(t, t)).toBe(0);
  });

  it('returns correct hours between two dates', () => {
    const a = '2024-01-01T00:00:00Z';
    const b = '2024-01-01T06:00:00Z';
    expect(hoursBetween(a, b)).toBe(6);
  });

  it('is order-independent (absolute value)', () => {
    const a = '2024-01-01T00:00:00Z';
    const b = '2024-01-01T12:00:00Z';
    expect(hoursBetween(a, b)).toBe(hoursBetween(b, a));
  });
});

describe('longestGap', () => {
  it('returns 0 for empty or single-item arrays', () => {
    expect(longestGap([])).toBe(0);
    expect(longestGap([ts(10)])).toBe(0);
  });

  it('returns the largest gap between consecutive events', () => {
    const times = [ts(100), ts(60), ts(10), ts(5)];
    const gap = longestGap(times);
    // largest gap: ts(100) -> ts(60) = 40h
    expect(gap).toBeCloseTo(40, 0);
  });

  it('handles two timestamps', () => {
    const a = '2024-03-01T00:00:00Z';
    const b = '2024-03-03T00:00:00Z';
    expect(longestGap([a, b])).toBe(48);
  });
});

describe('isStalled', () => {
  it('returns false when all gaps are below threshold', () => {
    const times = [ts(10), ts(5), ts(1)];
    expect(isStalled(times, 48)).toBe(false);
  });

  it('returns true when a gap meets or exceeds threshold', () => {
    const times = [ts(72), ts(20), ts(1)];
    expect(isStalled(times, 48)).toBe(true);
  });

  it('uses 48h as default threshold', () => {
    const times = [ts(50), ts(1)];
    expect(isStalled(times)).toBe(true);
  });
});

describe('annotateWithTimeline', () => {
  it('adds longestGapHours and isStalled to each PR', () => {
    const prs = [
      { id: 1, timeline: [ts(100), ts(40)] },
      { id: 2, timeline: [ts(10), ts(5)] },
    ];
    const result = annotateWithTimeline(prs, 48);
    expect(result[0].isStalled).toBe(true);
    expect(result[0].longestGapHours).toBeGreaterThanOrEqual(48);
    expect(result[1].isStalled).toBe(false);
  });

  it('handles PRs with no timeline', () => {
    const prs = [{ id: 3 }];
    const result = annotateWithTimeline(prs);
    expect(result[0].isStalled).toBe(false);
    expect(result[0].longestGapHours).toBe(0);
  });
});

describe('filterStalledPRs', () => {
  it('returns only stalled PRs', () => {
    const prs = [
      { id: 1, timeline: [ts(100), ts(40)] },
      { id: 2, timeline: [ts(10), ts(5)] },
      { id: 3, timeline: [ts(200), ts(100)] },
    ];
    const result = filterStalledPRs(prs, 48);
    expect(result.map((p) => p.id)).toEqual([1, 3]);
  });

  it('returns empty array when no PRs are stalled', () => {
    const prs = [{ id: 1, timeline: [ts(5), ts(1)] }];
    expect(filterStalledPRs(prs, 48)).toHaveLength(0);
  });
});
