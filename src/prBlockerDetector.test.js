const {
  hasFailingChecks,
  hasChangesRequested,
  getBlockers,
  annotateWithBlockers,
  filterBlockedPRs,
} = require('./prBlockerDetector');

function makePR(overrides = {}) {
  return {
    number: 1,
    title: 'Test PR',
    checkRuns: [],
    reviews: [],
    ...overrides,
  };
}

describe('hasFailingChecks', () => {
  it('returns false when no checks', () => {
    expect(hasFailingChecks(makePR())).toBe(false);
  });

  it('returns true when a check has failure conclusion', () => {
    const pr = makePR({ checkRuns: [{ conclusion: 'failure' }] });
    expect(hasFailingChecks(pr)).toBe(true);
  });

  it('returns true when a check has error conclusion', () => {
    const pr = makePR({ checkRuns: [{ conclusion: 'error' }] });
    expect(hasFailingChecks(pr)).toBe(true);
  });

  it('returns false when all checks pass', () => {
    const pr = makePR({ checkRuns: [{ conclusion: 'success' }] });
    expect(hasFailingChecks(pr)).toBe(false);
  });
});

describe('hasChangesRequested', () => {
  it('returns false when no reviews', () => {
    expect(hasChangesRequested(makePR())).toBe(false);
  });

  it('returns true when changes requested', () => {
    const pr = makePR({ reviews: [{ state: 'CHANGES_REQUESTED' }] });
    expect(hasChangesRequested(pr)).toBe(true);
  });

  it('returns false when review is approved', () => {
    const pr = makePR({ reviews: [{ state: 'APPROVED' }] });
    expect(hasChangesRequested(pr)).toBe(false);
  });
});

describe('getBlockers', () => {
  it('returns empty array for clean PR', () => {
    expect(getBlockers(makePR())).toEqual([]);
  });

  it('returns both blockers when both conditions met', () => {
    const pr = makePR({
      checkRuns: [{ conclusion: 'failure' }],
      reviews: [{ state: 'CHANGES_REQUESTED' }],
    });
    expect(getBlockers(pr)).toEqual(['failing_checks', 'changes_requested']);
  });
});

describe('annotateWithBlockers', () => {
  it('adds blockers array to each PR', () => {
    const prs = [makePR(), makePR({ checkRuns: [{ conclusion: 'failure' }] })];
    const result = annotateWithBlockers(prs);
    expect(result[0].blockers).toEqual([]);
    expect(result[1].blockers).toEqual(['failing_checks']);
  });
});

describe('filterBlockedPRs', () => {
  it('returns only PRs with at least one blocker', () => {
    const prs = [
      makePR(),
      makePR({ reviews: [{ state: 'CHANGES_REQUESTED' }] }),
    ];
    const result = filterBlockedPRs(prs);
    expect(result).toHaveLength(1);
    expect(result[0].reviews[0].state).toBe('CHANGES_REQUESTED');
  });

  it('returns empty array when no blocked PRs', () => {
    expect(filterBlockedPRs([makePR(), makePR()])).toEqual([]);
  });
});
