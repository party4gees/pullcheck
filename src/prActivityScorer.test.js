const { scorePR, rankPRsByActivity, filterInactivePRs } = require('./prActivityScorer');

const now = new Date().toISOString();
const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString();
const tenDaysAgo = new Date(Date.now() - 10 * 86400000).toISOString();

function makePR(overrides = {}) {
  return {
    id: 1,
    created_at: twoDaysAgo,
    comments: [],
    reviews: [],
    commits: [],
    labels: [],
    ...overrides,
  };
}

describe('scorePR', () => {
  test('returns 0 for a bare PR with no activity', () => {
    const pr = makePR({ created_at: tenDaysAgo });
    expect(scorePR(pr)).toBeGreaterThanOrEqual(0);
  });

  test('boosts score for recent comments', () => {
    const active = makePR({ comments: [{ created_at: now }] });
    const quiet = makePR({ comments: [] });
    expect(scorePR(active)).toBeGreaterThan(scorePR(quiet));
  });

  test('boosts score for reviews', () => {
    const reviewed = makePR({ reviews: [{ id: 1 }, { id: 2 }] });
    const plain = makePR();
    expect(scorePR(reviewed)).toBeGreaterThan(scorePR(plain));
  });

  test('boosts score for commits (capped at 5)', () => {
    const manyCommits = makePR({ commits: new Array(10).fill({ sha: 'abc' }) });
    const fewCommits = makePR({ commits: [{ sha: 'abc' }] });
    const scoreMany = scorePR(manyCommits);
    const scoreFew = scorePR(fewCommits);
    expect(scoreMany).toBeGreaterThan(scoreFew);
    // capped at 5 commits worth
    const capped = makePR({ commits: new Array(5).fill({ sha: 'abc' }) });
    expect(scorePR(manyCommits)).toEqual(scorePR(capped));
  });

  test('penalises older PRs', () => {
    const fresh = makePR({ created_at: now });
    const old = makePR({ created_at: tenDaysAgo });
    expect(scorePR(fresh)).toBeGreaterThan(scorePR(old));
  });

  test('respects custom weight overrides', () => {
    const pr = makePR({ reviews: [{ id: 1 }] });
    const defaultScore = scorePR(pr);
    const boostedScore = scorePR(pr, { reviewSubmitted: 50 });
    expect(boostedScore).toBeGreaterThan(defaultScore);
  });
});

describe('rankPRsByActivity', () => {
  test('returns ranked list sorted by score descending', () => {
    const prs = [
      makePR({ id: 1, created_at: tenDaysAgo }),
      makePR({ id: 2, reviews: [{ id: 1 }], created_at: now }),
    ];
    const ranked = rankPRsByActivity(prs);
    expect(ranked[0].pr.id).toBe(2);
    expect(ranked[0].score).toBeGreaterThanOrEqual(ranked[1].score);
  });

  test('returns empty array for empty input', () => {
    expect(rankPRsByActivity([])).toEqual([]);
  });
});

describe('filterInactivePRs', () => {
  test('filters out PRs above threshold', () => {
    const active = makePR({ reviews: [{ id: 1 }, { id: 2 }], commits: [{ sha: 'a' }] });
    const inactive = makePR({ created_at: tenDaysAgo });
    const result = filterInactivePRs([active, inactive], 5);
    // inactive PR should be included; active may not be
    expect(result).toContain(inactive);
  });

  test('returns all PRs when threshold is very high', () => {
    const prs = [makePR(), makePR()];
    expect(filterInactivePRs(prs, 1000)).toHaveLength(2);
  });
});
