const {
  rollupStatus,
  statusEmoji,
  annotateWithRollup,
  formatRollupLine,
  buildRollupMessage,
} = require('./prStatusRollup');

function makePR(overrides = {}) {
  return {
    title: 'Test PR',
    url: 'https://github.com/org/repo/pull/1',
    approvals: 1,
    mergeable: true,
    statusChecks: [{ state: 'success' }],
    ...overrides,
  };
}

describe('rollupStatus', () => {
  it('returns green when checks pass and has approvals', () => {
    expect(rollupStatus(makePR())).toBe('green');
  });

  it('returns red when a check is failing', () => {
    const pr = makePR({ statusChecks: [{ state: 'failure' }] });
    expect(rollupStatus(pr)).toBe('red');
  });

  it('returns red when mergeable is false', () => {
    const pr = makePR({ mergeable: false });
    expect(rollupStatus(pr)).toBe('red');
  });

  it('returns yellow when checks are pending', () => {
    const pr = makePR({ statusChecks: [{ state: 'pending' }] });
    expect(rollupStatus(pr)).toBe('yellow');
  });

  it('returns yellow when no approvals', () => {
    const pr = makePR({ approvals: 0 });
    expect(rollupStatus(pr)).toBe('yellow');
  });

  it('returns yellow when statusChecks is empty and no approvals', () => {
    const pr = makePR({ statusChecks: [], approvals: 0 });
    expect(rollupStatus(pr)).toBe('yellow');
  });
});

describe('statusEmoji', () => {
  it('maps green to ✅', () => expect(statusEmoji('green')).toBe('✅'));
  it('maps yellow to ⏳', () => expect(statusEmoji('yellow')).toBe('⏳'));
  it('maps red to 🚨', () => expect(statusEmoji('red')).toBe('🚨'));
  it('returns ❓ for unknown', () => expect(statusEmoji('unknown')).toBe('❓'));
});

describe('annotateWithRollup', () => {
  it('adds rollupStatus and rollupEmoji to each PR', () => {
    const prs = [makePR(), makePR({ approvals: 0 })];
    const result = annotateWithRollup(prs);
    expect(result[0].rollupStatus).toBe('green');
    expect(result[0].rollupEmoji).toBe('✅');
    expect(result[1].rollupStatus).toBe('yellow');
  });

  it('does not mutate original PRs', () => {
    const pr = makePR();
    annotateWithRollup([pr]);
    expect(pr.rollupStatus).toBeUndefined();
  });
});

describe('formatRollupLine', () => {
  it('includes title, approvals, and check count', () => {
    const pr = { ...makePR(), rollupStatus: 'green', rollupEmoji: '✅' };
    const line = formatRollupLine(pr);
    expect(line).toContain('Test PR');
    expect(line).toContain('1 approval(s)');
    expect(line).toContain('1 check(s)');
  });

  it('appends conflict warning when not mergeable', () => {
    const pr = { ...makePR({ mergeable: false }), rollupStatus: 'red', rollupEmoji: '🚨' };
    expect(formatRollupLine(pr)).toContain('conflict');
  });
});

describe('buildRollupMessage', () => {
  it('returns placeholder for empty list', () => {
    expect(buildRollupMessage([])).toBe('_No PRs to report._');
  });

  it('includes PR count in header', () => {
    const msg = buildRollupMessage([makePR(), makePR()]);
    expect(msg).toContain('2 PRs');
  });

  it('uses singular for one PR', () => {
    const msg = buildRollupMessage([makePR()]);
    expect(msg).toContain('1 PR)');
  });
});
