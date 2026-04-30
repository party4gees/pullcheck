const {
  isWipTitle,
  isWipLabel,
  isWip,
  annotateWithWip,
  filterWip,
  isolateWip
} = require('./prWipDetector');

function makePR(overrides = {}) {
  return { title: 'Add feature', labels: [], draft: false, number: 1, ...overrides };
}

describe('isWipTitle', () => {
  it('detects wip: prefix', () => expect(isWipTitle('wip: my change')).toBe(true));
  it('detects [wip] prefix', () => expect(isWipTitle('[WIP] my change')).toBe(true));
  it('detects do not merge prefix', () => expect(isWipTitle('Do Not Merge: broken')).toBe(true));
  it('returns false for normal title', () => expect(isWipTitle('Fix bug in login')).toBe(false));
  it('handles empty string', () => expect(isWipTitle('')).toBe(false));
  it('handles null', () => expect(isWipTitle(null)).toBe(false));
});

describe('isWipLabel', () => {
  it('detects wip label', () => expect(isWipLabel(['wip', 'bug'])).toBe(true));
  it('detects work in progress label', () => expect(isWipLabel(['Work In Progress'])).toBe(true));
  it('returns false with no wip labels', () => expect(isWipLabel(['bug', 'feature'])).toBe(false));
  it('handles empty array', () => expect(isWipLabel([])).toBe(false));
});

describe('isWip', () => {
  it('returns true for draft PR', () => {
    expect(isWip(makePR({ draft: true }))).toBe(true);
  });
  it('returns true for wip title', () => {
    expect(isWip(makePR({ title: 'wip: something' }))).toBe(true);
  });
  it('returns true for wip label', () => {
    expect(isWip(makePR({ labels: ['wip'] }))).toBe(true);
  });
  it('returns false for normal PR', () => {
    expect(isWip(makePR())).toBe(false);
  });
});

describe('annotateWithWip', () => {
  it('annotates PRs with wip flag', () => {
    const prs = [makePR({ title: 'wip: test' }), makePR({ title: 'Ready' })];
    const result = annotateWithWip(prs);
    expect(result[0].wip).toBe(true);
    expect(result[1].wip).toBe(false);
  });
  it('does not mutate original', () => {
    const pr = makePR();
    annotateWithWip([pr]);
    expect(pr.wip).toBeUndefined();
  });
});

describe('filterWip', () => {
  it('removes wip PRs', () => {
    const prs = [makePR({ draft: true }), makePR({ title: 'Ship it' })];
    expect(filterWip(prs)).toHaveLength(1);
    expect(filterWip(prs)[0].title).toBe('Ship it');
  });
});

describe('isolateWip', () => {
  it('returns only wip PRs', () => {
    const prs = [makePR({ draft: true }), makePR({ title: 'Ship it' })];
    const result = isolateWip(prs);
    expect(result).toHaveLength(1);
    expect(result[0].draft).toBe(true);
  });
});
