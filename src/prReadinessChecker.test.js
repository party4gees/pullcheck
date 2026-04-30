const {
  getReadinessBlockers,
  isReady,
  annotateWithReadiness,
  filterReadyPRs,
} = require('./prReadinessChecker');

function makePR(overrides = {}) {
  return {
    number: 1,
    title: 'Test PR',
    draft: false,
    conflictStatus: 'clean',
    approvals: [{ user: 'alice' }],
    blockers: [],
    ...overrides,
  };
}

describe('getReadinessBlockers', () => {
  test('returns empty array for a fully ready PR', () => {
    const pr = makePR();
    expect(getReadinessBlockers(pr)).toEqual([]);
  });

  test('flags draft PRs', () => {
    const pr = makePR({ draft: true });
    const blockers = getReadinessBlockers(pr);
    expect(blockers).toContain('PR is still a draft');
  });

  test('flags conflicted PRs', () => {
    const pr = makePR({ conflictStatus: 'conflicted' });
    const blockers = getReadinessBlockers(pr);
    expect(blockers).toContain('PR has merge conflicts');
  });

  test('flags PRs behind base', () => {
    const pr = makePR({ conflictStatus: 'behind' });
    const blockers = getReadinessBlockers(pr);
    expect(blockers).toContain('PR is behind base branch');
  });

  test('flags insufficient approvals', () => {
    const pr = makePR({ approvals: [] });
    const blockers = getReadinessBlockers(pr, { requiredApprovals: 2 });
    expect(blockers).toContain('Needs 2 more approval(s) (has 0)');
  });

  test('flags failing checks', () => {
    const pr = makePR({ blockers: ['failing_checks'] });
    const blockers = getReadinessBlockers(pr);
    expect(blockers).toContain('CI checks are failing');
  });

  test('flags changes requested', () => {
    const pr = makePR({ blockers: ['changes_requested'] });
    const blockers = getReadinessBlockers(pr);
    expect(blockers).toContain('Changes have been requested');
  });

  test('can return multiple blockers at once', () => {
    const pr = makePR({ draft: true, conflictStatus: 'conflicted', approvals: [], blockers: ['failing_checks'] });
    const blockers = getReadinessBlockers(pr);
    expect(blockers.length).toBeGreaterThanOrEqual(3);
  });
});

describe('isReady', () => {
  test('returns true when no blockers', () => {
    expect(isReady(makePR())).toBe(true);
  });

  test('returns false when there are blockers', () => {
    expect(isReady(makePR({ draft: true }))).toBe(false);
  });
});

describe('annotateWithReadiness', () => {
  test('adds ready and readinessBlockers fields', () => {
    const prs = [makePR(), makePR({ draft: true })];
    const result = annotateWithReadiness(prs);
    expect(result[0].ready).toBe(true);
    expect(result[0].readinessBlockers).toEqual([]);
    expect(result[1].ready).toBe(false);
    expect(result[1].readinessBlockers).toContain('PR is still a draft');
  });
});

describe('filterReadyPRs', () => {
  test('returns only ready PRs', () => {
    const prs = [makePR(), makePR({ draft: true }), makePR({ conflictStatus: 'conflicted' })];
    const result = filterReadyPRs(prs);
    expect(result).toHaveLength(1);
    expect(result[0].draft).toBe(false);
  });

  test('returns empty array when none are ready', () => {
    const prs = [makePR({ draft: true }), makePR({ approvals: [] })];
    expect(filterReadyPRs(prs)).toHaveLength(0);
  });
});
