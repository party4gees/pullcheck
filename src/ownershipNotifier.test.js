const {
  formatOwnershipLine,
  buildOwnerDigest,
  buildOwnershipMessages
} = require('./ownershipNotifier');

function makePR(overrides = {}) {
  return {
    number: 42,
    title: 'Fix bug',
    html_url: 'https://github.com/org/repo/pull/42',
    owner: 'alice',
    staleDays: 5,
    ...overrides
  };
}

describe('formatOwnershipLine', () => {
  it('includes PR number, title, and age', () => {
    const line = formatOwnershipLine(makePR());
    expect(line).toContain('#42');
    expect(line).toContain('Fix bug');
    expect(line).toContain('5d old');
  });

  it('omits age when staleDays is undefined', () => {
    const pr = makePR({ staleDays: undefined });
    const line = formatOwnershipLine(pr);
    expect(line).not.toContain('old');
  });

  it('uses plain number when no html_url', () => {
    const pr = makePR({ html_url: undefined });
    const line = formatOwnershipLine(pr);
    expect(line).toContain('#42');
  });
});

describe('buildOwnerDigest', () => {
  it('includes the slack handle', () => {
    const msg = buildOwnerDigest('@alice', [makePR()]);
    expect(msg).toContain('@alice');
  });

  it('mentions the correct PR count', () => {
    const msg = buildOwnerDigest('@alice', [makePR(), makePR({ number: 43 })]);
    expect(msg).toContain('2 open PR(s)');
  });

  it('lists all PRs', () => {
    const msg = buildOwnerDigest('@alice', [makePR({ title: 'Alpha' }), makePR({ title: 'Beta' })]);
    expect(msg).toContain('Alpha');
    expect(msg).toContain('Beta');
  });
});

describe('buildOwnershipMessages', () => {
  it('returns one message per owner', () => {
    const prs = [
      makePR({ owner: 'alice' }),
      makePR({ number: 43, owner: 'bob' })
    ];
    const results = buildOwnershipMessages(prs, { alice: 'alice_slack', bob: 'bob_slack' });
    expect(results).toHaveLength(2);
    const handles = results.map(r => r.handle);
    expect(handles).toContain('@alice_slack');
    expect(handles).toContain('@bob_slack');
  });

  it('falls back to github login when no reviewer map entry', () => {
    const prs = [makePR({ owner: 'carol' })];
    const results = buildOwnershipMessages(prs, {});
    expect(results[0].handle).toBe('@carol');
  });

  it('returns empty array for no PRs', () => {
    expect(buildOwnershipMessages([], {})).toEqual([]);
  });
});
