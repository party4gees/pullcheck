const {
  formatCycleTimeLine,
  filterNotableSlowPRs,
  buildCycleTimeAlertMessage,
} = require('./cycleTimeNotifier');

function daysAgo(n) {
  return new Date(Date.now() - n * 24 * 3600 * 1000).toISOString();
}

function makePR(overrides = {}) {
  return {
    number: 42,
    title: 'My PR',
    url: 'https://github.com/org/repo/pull/42',
    createdAt: daysAgo(3),
    mergedAt: null,
    closedAt: null,
    ...overrides,
  };
}

describe('formatCycleTimeLine', () => {
  it('includes PR number and title', () => {
    const pr = makePR({ createdAt: daysAgo(1), mergedAt: new Date().toISOString() });
    const line = formatCycleTimeLine(pr);
    expect(line).toContain('#42');
    expect(line).toContain('My PR');
  });

  it('shows stalled emoji for very old PRs', () => {
    const pr = makePR({ createdAt: daysAgo(10) });
    const line = formatCycleTimeLine(pr);
    expect(line).toContain('🚨');
    expect(line).toContain('stalled');
  });

  it('shows fast emoji for quick PRs', () => {
    const pr = makePR({
      createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
      mergedAt: new Date().toISOString(),
    });
    const line = formatCycleTimeLine(pr);
    expect(line).toContain('⚡');
  });
});

describe('filterNotableSlowPRs', () => {
  it('keeps slow and stalled PRs', () => {
    const prs = [
      makePR({ createdAt: daysAgo(1), mergedAt: new Date().toISOString() }), // fast
      makePR({ createdAt: daysAgo(5) }),  // slow/stalled
      makePR({ createdAt: daysAgo(10) }), // stalled
    ];
    const result = filterNotableSlowPRs(prs);
    expect(result).toHaveLength(2);
  });

  it('returns empty array when all PRs are fast', () => {
    const prs = [
      makePR({ createdAt: new Date(Date.now() - 3600 * 1000).toISOString(), mergedAt: new Date().toISOString() }),
    ];
    expect(filterNotableSlowPRs(prs)).toHaveLength(0);
  });
});

describe('buildCycleTimeAlertMessage', () => {
  it('returns null when no notable PRs', () => {
    const prs = [
      makePR({ createdAt: new Date(Date.now() - 3600 * 1000).toISOString(), mergedAt: new Date().toISOString() }),
    ];
    expect(buildCycleTimeAlertMessage(prs, 'my-repo')).toBeNull();
  });

  it('returns a message with header and section blocks', () => {
    const prs = [makePR({ createdAt: daysAgo(8) })];
    const msg = buildCycleTimeAlertMessage(prs, 'my-repo');
    expect(msg).not.toBeNull();
    expect(msg.blocks[0].type).toBe('header');
    expect(msg.blocks[1].type).toBe('section');
    expect(msg.text).toContain('my-repo');
  });

  it('includes average cycle time in context block', () => {
    const prs = [makePR({ createdAt: daysAgo(8) })];
    const msg = buildCycleTimeAlertMessage(prs, 'my-repo');
    expect(msg.blocks[2].elements[0].text).toContain('Avg cycle time');
  });
});
