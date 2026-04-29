const {
  countReopens,
  lastReopenedAt,
  annotateWithReopenInfo,
  filterReopenedPRs,
} = require('./prReopenTracker');

const events = [
  { event: 'closed', created_at: '2024-01-01T10:00:00Z' },
  { event: 'reopened', created_at: '2024-01-02T10:00:00Z' },
  { event: 'closed', created_at: '2024-01-05T10:00:00Z' },
  { event: 'reopened', created_at: '2024-01-06T10:00:00Z' },
];

function makePR(overrides = {}) {
  return {
    number: 42,
    title: 'Test PR',
    timelineEvents: events,
    ...overrides,
  };
}

describe('countReopens', () => {
  test('counts reopened events correctly', () => {
    expect(countReopens(events)).toBe(2);
  });

  test('returns 0 when no reopened events', () => {
    expect(countReopens([{ event: 'closed', created_at: '2024-01-01T00:00:00Z' }])).toBe(0);
  });

  test('returns 0 for empty events', () => {
    expect(countReopens([])).toBe(0);
  });

  test('returns 0 when events is undefined', () => {
    expect(countReopens()).toBe(0);
  });
});

describe('lastReopenedAt', () => {
  test('returns the most recent reopen timestamp', () => {
    expect(lastReopenedAt(events)).toBe('2024-01-06T10:00:00Z');
  });

  test('returns null when never reopened', () => {
    expect(lastReopenedAt([{ event: 'closed', created_at: '2024-01-01T00:00:00Z' }])).toBeNull();
  });

  test('returns null for empty events', () => {
    expect(lastReopenedAt([])).toBeNull();
  });
});

describe('annotateWithReopenInfo', () => {
  test('annotates PR with reopenCount and lastReopenedAt', () => {
    const [annotated] = annotateWithReopenInfo([makePR()]);
    expect(annotated.reopenCount).toBe(2);
    expect(annotated.lastReopenedAt).toBe('2024-01-06T10:00:00Z');
  });

  test('annotates PR with no events', () => {
    const [annotated] = annotateWithReopenInfo([makePR({ timelineEvents: [] })]);
    expect(annotated.reopenCount).toBe(0);
    expect(annotated.lastReopenedAt).toBeNull();
  });

  test('preserves original PR fields', () => {
    const [annotated] = annotateWithReopenInfo([makePR()]);
    expect(annotated.number).toBe(42);
    expect(annotated.title).toBe('Test PR');
  });
});

describe('filterReopenedPRs', () => {
  const prs = [
    { number: 1, reopenCount: 0 },
    { number: 2, reopenCount: 1 },
    { number: 3, reopenCount: 3 },
  ];

  test('filters PRs reopened at least once by default', () => {
    const result = filterReopenedPRs(prs);
    expect(result.map(p => p.number)).toEqual([2, 3]);
  });

  test('filters PRs reopened at least N times', () => {
    const result = filterReopenedPRs(prs, 2);
    expect(result.map(p => p.number)).toEqual([3]);
  });

  test('returns empty array when none qualify', () => {
    expect(filterReopenedPRs(prs, 10)).toEqual([]);
  });
});
