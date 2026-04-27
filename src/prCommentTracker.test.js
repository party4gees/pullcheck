const {
  daysSinceLastComment,
  isQuiet,
  filterQuietPRs,
  annotateWithQuietDays,
} = require('./prCommentTracker');

const NOW = new Date('2024-06-15T12:00:00Z');

describe('daysSinceLastComment', () => {
  it('returns correct days for a past date', () => {
    const last = '2024-06-12T12:00:00Z'; // 3 days ago
    expect(daysSinceLastComment(last, NOW)).toBe(3);
  });

  it('returns 0 for same day', () => {
    expect(daysSinceLastComment('2024-06-15T10:00:00Z', NOW)).toBe(0);
  });

  it('returns Infinity when lastCommentAt is null', () => {
    expect(daysSinceLastComment(null, NOW)).toBe(Infinity);
  });

  it('returns Infinity when lastCommentAt is undefined', () => {
    expect(daysSinceLastComment(undefined, NOW)).toBe(Infinity);
  });

  it('handles Date objects as input', () => {
    const last = new Date('2024-06-10T12:00:00Z'); // 5 days ago
    expect(daysSinceLastComment(last, NOW)).toBe(5);
  });
});

describe('isQuiet', () => {
  it('returns true when PR has been silent past threshold', () => {
    const pr = { lastCommentAt: '2024-06-11T12:00:00Z' }; // 4 days ago
    expect(isQuiet(pr, 3, NOW)).toBe(true);
  });

  it('returns false when PR commented recently', () => {
    const pr = { lastCommentAt: '2024-06-14T12:00:00Z' }; // 1 day ago
    expect(isQuiet(pr, 3, NOW)).toBe(false);
  });

  it('returns true when lastCommentAt is missing', () => {
    const pr = {};
    expect(isQuiet(pr, 3, NOW)).toBe(true);
  });

  it('uses default threshold of 3 days', () => {
    const pr = { lastCommentAt: '2024-06-12T12:00:00Z' }; // exactly 3 days
    expect(isQuiet(pr, undefined, NOW)).toBe(true);
  });
});

describe('filterQuietPRs', () => {
  const prs = [
    { id: 1, lastCommentAt: '2024-06-14T12:00:00Z' }, // 1 day — active
    { id: 2, lastCommentAt: '2024-06-11T12:00:00Z' }, // 4 days — quiet
    { id: 3, lastCommentAt: null },                   // no comment — quiet
    { id: 4, lastCommentAt: '2024-06-13T12:00:00Z' }, // 2 days — active
  ];

  it('returns only quiet PRs', () => {
    const result = filterQuietPRs(prs, 3, NOW);
    expect(result.map((p) => p.id)).toEqual([2, 3]);
  });

  it('returns empty array when all PRs are active', () => {
    const active = [{ id: 1, lastCommentAt: '2024-06-15T11:00:00Z' }];
    expect(filterQuietPRs(active, 3, NOW)).toHaveLength(0);
  });

  it('returns all PRs when threshold is 0', () => {
    expect(filterQuietPRs(prs, 0, NOW)).toHaveLength(prs.length);
  });
});

describe('annotateWithQuietDays', () => {
  it('adds quietDays field to each PR', () => {
    const prs = [
      { id: 1, lastCommentAt: '2024-06-12T12:00:00Z' },
      { id: 2, lastCommentAt: '2024-06-15T12:00:00Z' },
    ];
    const result = annotateWithQuietDays(prs, NOW);
    expect(result[0].quietDays).toBe(3);
    expect(result[1].quietDays).toBe(0);
  });

  it('does not mutate original PR objects', () => {
    const pr = { id: 1, lastCommentAt: '2024-06-10T12:00:00Z' };
    const [annotated] = annotateWithQuietDays([pr], NOW);
    expect(pr).not.toHaveProperty('quietDays');
    expect(annotated.quietDays).toBe(5);
  });

  it('sets quietDays to Infinity for PRs with no comment', () => {
    const prs = [{ id: 1 }];
    const [result] = annotateWithQuietDays(prs, NOW);
    expect(result.quietDays).toBe(Infinity);
  });
});
