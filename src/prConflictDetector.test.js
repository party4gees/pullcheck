const {
  hasConflict,
  isBehindBase,
  annotateWithConflictStatus,
  filterConflicted,
  filterBehindBase,
} = require('./prConflictDetector');

function makePR(overrides = {}) {
  return {
    number: 1,
    title: 'Test PR',
    mergeable: true,
    mergeableState: 'clean',
    ...overrides,
  };
}

describe('hasConflict', () => {
  it('returns true when mergeable is false', () => {
    expect(hasConflict(makePR({ mergeable: false }))).toBe(true);
  });

  it('returns true when mergeableState is dirty', () => {
    expect(hasConflict(makePR({ mergeableState: 'dirty' }))).toBe(true);
  });

  it('returns false for a clean PR', () => {
    expect(hasConflict(makePR())).toBe(false);
  });
});

describe('isBehindBase', () => {
  it('returns true when mergeableState is behind', () => {
    expect(isBehindBase(makePR({ mergeableState: 'behind' }))).toBe(true);
  });

  it('returns true when mergeableState is blocked', () => {
    expect(isBehindBase(makePR({ mergeableState: 'blocked' }))).toBe(true);
  });

  it('returns false for a clean PR', () => {
    expect(isBehindBase(makePR())).toBe(false);
  });
});

describe('annotateWithConflictStatus', () => {
  it('annotates PRs with hasConflict and isBehindBase flags', () => {
    const prs = [
      makePR({ mergeable: false }),
      makePR({ mergeableState: 'behind' }),
      makePR(),
    ];
    const result = annotateWithConflictStatus(prs);
    expect(result[0].hasConflict).toBe(true);
    expect(result[0].isBehindBase).toBe(false);
    expect(result[1].hasConflict).toBe(false);
    expect(result[1].isBehindBase).toBe(true);
    expect(result[2].hasConflict).toBe(false);
    expect(result[2].isBehindBase).toBe(false);
  });

  it('does not mutate original PR objects', () => {
    const pr = makePR({ mergeable: false });
    annotateWithConflictStatus([pr]);
    expect(pr.hasConflict).toBeUndefined();
  });
});

describe('filterConflicted', () => {
  it('returns only PRs with conflicts', () => {
    const prs = [makePR({ mergeable: false }), makePR(), makePR({ mergeableState: 'dirty' })];
    const result = filterConflicted(prs);
    expect(result).toHaveLength(2);
  });

  it('returns empty array when no conflicts', () => {
    expect(filterConflicted([makePR(), makePR()])).toHaveLength(0);
  });
});

describe('filterBehindBase', () => {
  it('returns only PRs behind base', () => {
    const prs = [makePR({ mergeableState: 'behind' }), makePR(), makePR({ mergeableState: 'blocked' })];
    const result = filterBehindBase(prs);
    expect(result).toHaveLength(2);
  });

  it('returns empty array when none are behind', () => {
    expect(filterBehindBase([makePR()])).toHaveLength(0);
  });
});
