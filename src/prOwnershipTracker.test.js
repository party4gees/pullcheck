const {
  resolveOwner,
  annotateWithOwner,
  groupByOwner,
  filterByOwner
} = require('./prOwnershipTracker');

function makePR(overrides = {}) {
  return {
    number: 1,
    title: 'Test PR',
    user: { login: 'author' },
    assignees: [],
    requested_reviewers: [],
    ...overrides
  };
}

describe('resolveOwner', () => {
  it('returns assignee when present', () => {
    const pr = makePR({ assignees: [{ login: 'alice' }] });
    expect(resolveOwner(pr)).toBe('alice');
  });

  it('returns requested reviewer when no assignee', () => {
    const pr = makePR({ requested_reviewers: [{ login: 'bob' }] });
    expect(resolveOwner(pr)).toBe('bob');
  });

  it('falls back to PR author', () => {
    const pr = makePR();
    expect(resolveOwner(pr)).toBe('author');
  });

  it('returns unknown when no user info', () => {
    const pr = { number: 99, title: 'bare' };
    expect(resolveOwner(pr)).toBe('unknown');
  });

  it('prefers assignee over reviewer', () => {
    const pr = makePR({
      assignees: [{ login: 'alice' }],
      requested_reviewers: [{ login: 'bob' }]
    });
    expect(resolveOwner(pr)).toBe('alice');
  });
});

describe('annotateWithOwner', () => {
  it('adds owner field to each PR', () => {
    const prs = [makePR({ assignees: [{ login: 'carol' }] }), makePR()];
    const result = annotateWithOwner(prs);
    expect(result[0].owner).toBe('carol');
    expect(result[1].owner).toBe('author');
  });

  it('does not mutate original PRs', () => {
    const pr = makePR();
    annotateWithOwner([pr]);
    expect(pr.owner).toBeUndefined();
  });
});

describe('groupByOwner', () => {
  it('groups PRs by owner', () => {
    const prs = [
      { ...makePR({ number: 1 }), owner: 'alice' },
      { ...makePR({ number: 2 }), owner: 'bob' },
      { ...makePR({ number: 3 }), owner: 'alice' }
    ];
    const groups = groupByOwner(prs);
    expect(groups['alice']).toHaveLength(2);
    expect(groups['bob']).toHaveLength(1);
  });

  it('returns empty object for empty input', () => {
    expect(groupByOwner([])).toEqual({});
  });
});

describe('filterByOwner', () => {
  it('returns only PRs matching the given login', () => {
    const prs = [
      { ...makePR({ number: 1 }), owner: 'alice' },
      { ...makePR({ number: 2 }), owner: 'bob' }
    ];
    const result = filterByOwner(prs, 'alice');
    expect(result).toHaveLength(1);
    expect(result[0].number).toBe(1);
  });

  it('returns empty array when no match', () => {
    const prs = [{ ...makePR(), owner: 'alice' }];
    expect(filterByOwner(prs, 'nobody')).toHaveLength(0);
  });
});
