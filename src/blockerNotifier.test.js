const { formatBlockerLine, buildBlockerAlertMessage } = require('./blockerNotifier');

function makePR(overrides = {}) {
  return {
    number: 42,
    title: 'Fix login bug',
    url: 'https://github.com/org/repo/pull/42',
    author: 'alice',
    blockers: [],
    ...overrides,
  };
}

describe('formatBlockerLine', () => {
  it('formats a PR with failing checks', () => {
    const pr = makePR({ blockers: ['failing_checks'] });
    const line = formatBlockerLine(pr);
    expect(line).toContain('#42');
    expect(line).toContain('Fix login bug');
    expect(line).toContain('failing_checks');
  });

  it('formats a PR with changes requested', () => {
    const pr = makePR({ blockers: ['changes_requested'] });
    const line = formatBlockerLine(pr);
    expect(line).toContain('changes_requested');
  });

  it('formats a PR with multiple blockers', () => {
    const pr = makePR({ blockers: ['failing_checks', 'changes_requested'] });
    const line = formatBlockerLine(pr);
    expect(line).toContain('failing_checks');
    expect(line).toContain('changes_requested');
  });

  it('includes the PR url', () => {
    const pr = makePR({ blockers: ['failing_checks'] });
    const line = formatBlockerLine(pr);
    expect(line).toContain('https://github.com/org/repo/pull/42');
  });
});

describe('buildBlockerAlertMessage', () => {
  it('returns null for empty list', () => {
    expect(buildBlockerAlertMessage([])).toBeNull();
  });

  it('builds a message with header', () => {
    const prs = [
      makePR({ number: 1, title: 'PR one', blockers: ['failing_checks'] }),
      makePR({ number: 2, title: 'PR two', blockers: ['changes_requested'] }),
    ];
    const msg = buildBlockerAlertMessage(prs);
    expect(msg).toContain('blocked');
    expect(msg).toContain('PR one');
    expect(msg).toContain('PR two');
  });

  it('includes count of blocked PRs', () => {
    const prs = [
      makePR({ number: 3, blockers: ['failing_checks'] }),
      makePR({ number: 4, blockers: ['changes_requested'] }),
      makePR({ number: 5, blockers: ['failing_checks'] }),
    ];
    const msg = buildBlockerAlertMessage(prs);
    expect(msg).toContain('3');
  });

  it('handles a single blocked PR', () => {
    const prs = [makePR({ number: 7, title: 'Solo PR', blockers: ['failing_checks'] })];
    const msg = buildBlockerAlertMessage(prs);
    expect(msg).toContain('Solo PR');
  });
});
