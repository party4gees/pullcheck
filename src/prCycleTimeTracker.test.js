const {
  hoursBetween,
  computeCycleTime,
  cycleTier,
  annotateWithCycleTime,
  averageCycleTime,
  filterSlowPRs,
} = require('./prCycleTimeTracker');

function makePR(overrides = {}) {
  return {
    number: 1,
    title: 'Test PR',
    createdAt: '2024-01-01T00:00:00Z',
    mergedAt: null,
    closedAt: null,
    ...overrides,
  };
}

describe('hoursBetween', () => {
  it('returns 24 for exactly one day apart', () => {
    expect(hoursBetween('2024-01-01T00:00:00Z', '2024-01-02T00:00:00Z')).toBe(24);
  });

  it('returns 0 for same timestamps', () => {
    expect(hoursBetween('2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z')).toBe(0);
  });
});

describe('computeCycleTime', () => {
  it('uses mergedAt when available', () => {
    const pr = makePR({ createdAt: '2024-01-01T00:00:00Z', mergedAt: '2024-01-02T00:00:00Z' });
    expect(computeCycleTime(pr)).toBe(24);
  });

  it('falls back to closedAt if no mergedAt', () => {
    const pr = makePR({ createdAt: '2024-01-01T00:00:00Z', closedAt: '2024-01-03T00:00:00Z' });
    expect(computeCycleTime(pr)).toBe(48);
  });

  it('uses now if neither mergedAt nor closedAt', () => {
    const pr = makePR({ createdAt: new Date(Date.now() - 3600 * 1000).toISOString() });
    expect(computeCycleTime(pr)).toBeCloseTo(1, 0);
  });
});

describe('cycleTier', () => {
  it('returns fast for <= 24h', () => expect(cycleTier(20)).toBe('fast'));
  it('returns normal for <= 72h', () => expect(cycleTier(50)).toBe('normal'));
  it('returns slow for <= 168h', () => expect(cycleTier(100)).toBe('slow'));
  it('returns stalled for > 168h', () => expect(cycleTier(200)).toBe('stalled'));
});

describe('annotateWithCycleTime', () => {
  it('adds cycleTimeHours and cycleTier to each PR', () => {
    const prs = [makePR({ createdAt: '2024-01-01T00:00:00Z', mergedAt: '2024-01-02T12:00:00Z' })];
    const result = annotateWithCycleTime(prs);
    expect(result[0].cycleTimeHours).toBe(36);
    expect(result[0].cycleTier).toBe('normal');
  });
});

describe('averageCycleTime', () => {
  it('returns 0 for empty array', () => expect(averageCycleTime([])).toBe(0));

  it('returns correct average', () => {
    const prs = [
      makePR({ createdAt: '2024-01-01T00:00:00Z', mergedAt: '2024-01-02T00:00:00Z' }),
      makePR({ createdAt: '2024-01-01T00:00:00Z', mergedAt: '2024-01-03T00:00:00Z' }),
    ];
    expect(averageCycleTime(prs)).toBe(36);
  });
});

describe('filterSlowPRs', () => {
  it('filters PRs exceeding threshold', () => {
    const prs = [
      makePR({ createdAt: '2024-01-01T00:00:00Z', mergedAt: '2024-01-02T00:00:00Z' }), // 24h
      makePR({ createdAt: '2024-01-01T00:00:00Z', mergedAt: '2024-01-05T00:00:00Z' }), // 96h
    ];
    const slow = filterSlowPRs(prs, 72);
    expect(slow).toHaveLength(1);
    expect(computeCycleTime(slow[0])).toBe(96);
  });
});
