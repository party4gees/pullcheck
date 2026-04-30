const { formatWipLine, filterStaleWip, buildWipAlertMessage } = require('./wipNotifier');

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function makePR(overrides = {}) {
  return {
    number: 42,
    title: 'WIP: my feature',
    html_url: 'https://github.com/org/repo/pull/42',
    labels: ['wip'],
    draft: false,
    created_at: daysAgo(5),
    ...overrides
  };
}

describe('formatWipLine', () => {
  it('includes PR number and title', () => {
    const line = formatWipLine(makePR());
    expect(line).toContain('#42');
    expect(line).toContain('WIP: my feature');
  });

  it('labels draft PRs as draft', () => {
    const line = formatWipLine(makePR({ draft: true, labels: [] }));
    expect(line).toContain('[draft]');
  });

  it('labels non-draft wip PRs as wip', () => {
    const line = formatWipLine(makePR({ draft: false }));
    expect(line).toContain('[wip]');
  });

  it('includes age in days', () => {
    const line = formatWipLine(makePR({ created_at: daysAgo(7) }));
    expect(line).toContain('7d');
  });
});

describe('filterStaleWip', () => {
  it('returns WIP PRs older than threshold', () => {
    const prs = [makePR({ created_at: daysAgo(5) }), makePR({ created_at: daysAgo(1) })];
    const result = filterStaleWip(prs, 3);
    expect(result).toHaveLength(1);
  });

  it('excludes non-WIP PRs', () => {
    const prs = [makePR({ labels: [], title: 'Normal PR', created_at: daysAgo(10) })];
    expect(filterStaleWip(prs, 3)).toHaveLength(0);
  });

  it('uses default threshold of 3 days', () => {
    const prs = [makePR({ created_at: daysAgo(4) })];
    expect(filterStaleWip(prs)).toHaveLength(1);
  });
});

describe('buildWipAlertMessage', () => {
  it('returns null when no stale wip PRs', () => {
    const prs = [makePR({ created_at: daysAgo(1) })];
    expect(buildWipAlertMessage(prs)).toBeNull();
  });

  it('includes repo name when provided', () => {
    const prs = [makePR()];
    const msg = buildWipAlertMessage(prs, { repo: 'org/repo', staleDays: 3 });
    expect(msg).toContain('org/repo');
  });

  it('includes count in header', () => {
    const prs = [makePR(), makePR({ number: 43 })];
    const msg = buildWipAlertMessage(prs, { staleDays: 3 });
    expect(msg).toContain('2 stale WIP PRs');
  });

  it('uses singular form for one PR', () => {
    const prs = [makePR()];
    const msg = buildWipAlertMessage(prs, { staleDays: 3 });
    expect(msg).toContain('1 stale WIP PR');
    expect(msg).not.toContain('PRs');
  });
});
