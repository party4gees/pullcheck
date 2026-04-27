const { formatUncoveredLine, buildCoverageAlertMessage } = require('./coverageNotifier');

function makePR(overrides = {}) {
  return {
    number: 42,
    title: 'Add feature',
    html_url: 'https://github.com/org/repo/pull/42',
    requested_reviewers: [],
    reviews: [],
    ...overrides,
  };
}

describe('formatUncoveredLine', () => {
  it('formats a PR without age', () => {
    const pr = makePR();
    const line = formatUncoveredLine(pr);
    expect(line).toContain('#42');
    expect(line).toContain('no reviewer assigned');
    expect(line).not.toContain('old');
  });

  it('includes age when provided', () => {
    const pr = makePR({ age: 7 });
    const line = formatUncoveredLine(pr);
    expect(line).toContain('7d old');
  });
});

describe('buildCoverageAlertMessage', () => {
  it('returns null when all PRs are covered and approved', () => {
    const prs = [
      makePR({
        requested_reviewers: [{ login: 'alice' }],
        reviews: [{ state: 'APPROVED' }],
      }),
    ];
    expect(buildCoverageAlertMessage(prs, { minApprovals: 1 })).toBeNull();
  });

  it('includes uncovered PRs section', () => {
    const prs = [makePR({ number: 10, title: 'Fix bug' })];
    const msg = buildCoverageAlertMessage(prs, { repoName: 'my-repo' });
    expect(msg).toContain('No reviewer assigned');
    expect(msg).toContain('#10');
    expect(msg).toContain('my-repo');
  });

  it('includes unapproved PRs section', () => {
    const prs = [
      makePR({
        number: 20,
        title: 'Refactor',
        requested_reviewers: [{ login: 'bob' }],
        reviews: [],
      }),
    ];
    const msg = buildCoverageAlertMessage(prs, { minApprovals: 1 });
    expect(msg).toContain('Awaiting approval');
    expect(msg).toContain('0/1 approvals');
  });

  it('shows both sections when applicable', () => {
    const prs = [
      makePR({ number: 1 }),
      makePR({
        number: 2,
        requested_reviewers: [{ login: 'carol' }],
        reviews: [],
      }),
    ];
    const msg = buildCoverageAlertMessage(prs, { minApprovals: 1 });
    expect(msg).toContain('No reviewer assigned');
    expect(msg).toContain('Awaiting approval');
  });

  it('uses default repoName when not provided', () => {
    const prs = [makePR()];
    const msg = buildCoverageAlertMessage(prs);
    expect(msg).toContain('repo');
  });
});
