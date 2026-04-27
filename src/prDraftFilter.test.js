const {
  isDraft,
  filterDrafts,
  isolateDrafts,
  annotateWithDraftStatus,
  draftSummary,
} = require('./prDraftFilter');

function makePR(id, draft = false) {
  return { id, title: `PR #${id}`, draft };
}

describe('isDraft', () => {
  it('returns true for draft PRs', () => {
    expect(isDraft(makePR(1, true))).toBe(true);
  });

  it('returns false for ready PRs', () => {
    expect(isDraft(makePR(2, false))).toBe(false);
  });

  it('returns false when draft field is missing', () => {
    expect(isDraft({ id: 3, title: 'PR #3' })).toBe(false);
  });
});

describe('filterDrafts', () => {
  it('removes draft PRs from the list', () => {
    const prs = [makePR(1, true), makePR(2, false), makePR(3, true)];
    const result = filterDrafts(prs);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  it('returns all PRs when none are drafts', () => {
    const prs = [makePR(1), makePR(2)];
    expect(filterDrafts(prs)).toHaveLength(2);
  });

  it('returns empty array when all are drafts', () => {
    expect(filterDrafts([makePR(1, true)])).toHaveLength(0);
  });
});

describe('isolateDrafts', () => {
  it('returns only draft PRs', () => {
    const prs = [makePR(1, true), makePR(2, false), makePR(3, true)];
    const result = isolateDrafts(prs);
    expect(result).toHaveLength(2);
    expect(result.map((p) => p.id)).toEqual([1, 3]);
  });
});

describe('annotateWithDraftStatus', () => {
  it('adds isDraft field to each PR', () => {
    const prs = [makePR(1, true), makePR(2, false)];
    const result = annotateWithDraftStatus(prs);
    expect(result[0].isDraft).toBe(true);
    expect(result[1].isDraft).toBe(false);
  });

  it('does not mutate original objects', () => {
    const pr = makePR(1, true);
    annotateWithDraftStatus([pr]);
    expect(pr).not.toHaveProperty('isDraft');
  });
});

describe('draftSummary', () => {
  it('returns correct counts', () => {
    const prs = [makePR(1, true), makePR(2, false), makePR(3, true)];
    expect(draftSummary(prs)).toEqual({ total: 3, drafts: 2, ready: 1 });
  });

  it('handles empty list', () => {
    expect(draftSummary([])).toEqual({ total: 0, drafts: 0, ready: 0 });
  });
});
