const { buildActivityDashboard, formatRankedEntry } = require('./activityDashboard');

const now = new Date().toISOString();
const tenDaysAgo = new Date(Date.now() - 10 * 86400000).toISOString();

function makePR(overrides = {}) {
  return {
    number: 42,
    title: 'Test PR',
    html_url: 'https://github.com/org/repo/pull/42',
    created_at: now,
    comments: [],
    reviews: [],
    commits: [],
    labels: [],
    ...overrides,
  };
}

describe('formatRankedEntry', () => {
  test('includes PR title and score', () => {
    const entry = { pr: makePR(), score: 12 };
    const line = formatRankedEntry(entry, 0);
    expect(line).toContain('Test PR');
    expect(line).toContain('score: 12');
  });

  test('includes PR URL when present', () => {
    const entry = { pr: makePR(), score: 8 };
    const line = formatRankedEntry(entry, 0);
    expect(line).toContain('https://github.com/org/repo/pull/42');
  });

  test('falls back to PR number when no title', () => {
    const entry = { pr: makePR({ title: undefined }), score: 3 };
    const line = formatRankedEntry(entry, 0);
    expect(line).toContain('PR #42');
  });

  test('uses correct index prefix', () => {
    const entry = { pr: makePR(), score: 5 };
    expect(formatRankedEntry(entry, 2)).toMatch(/^3\./);
  });
});

describe('buildActivityDashboard', () => {
  test('returns a blocks array', () => {
    const result = buildActivityDashboard([makePR()]);
    expect(result).toHaveProperty('blocks');
    expect(Array.isArray(result.blocks)).toBe(true);
  });

  test('header mentions PR count', () => {
    const prs = [makePR(), makePR({ number: 43 })];
    const result = buildActivityDashboard(prs);
    const header = result.blocks[0].text.text;
    expect(header).toContain('2 open PR(s)');
  });

  test('shows empty message when no PRs', () => {
    const result = buildActivityDashboard([]);
    const body = result.blocks[2].text.text;
    expect(body).toContain('No open pull requests found');
  });

  test('respects topN option', () => {
    const prs = Array.from({ length: 10 }, (_, i) =>
      makePR({ number: i + 1, title: `PR ${i + 1}` })
    );
    const result = buildActivityDashboard(prs, { topN: 3 });
    const body = result.blocks[2].text.text;
    const lines = body.split('\n');
    expect(lines).toHaveLength(3);
  });

  test('footer shows inactive count', () => {
    const prs = [makePR({ created_at: tenDaysAgo })];
    const result = buildActivityDashboard(prs, { inactiveThreshold: 100 });
    const footer = result.blocks[3].elements[0].text;
    expect(footer).toContain('1 PR(s) below activity threshold');
  });
});
