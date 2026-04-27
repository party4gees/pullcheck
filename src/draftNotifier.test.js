const {
  formatDraftLine,
  filterStaleDrafts,
  buildDraftAlertMessage,
} = require('./draftNotifier');

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function makePR(id, draft, ageDays, login = 'alice') {
  return {
    id,
    title: `PR #${id}`,
    html_url: `https://github.com/org/repo/pull/${id}`,
    draft,
    created_at: daysAgo(ageDays),
    user: { login },
  };
}

describe('formatDraftLine', () => {
  it('includes title, age and author', () => {
    const pr = makePR(1, true, 7, 'bob');
    const line = formatDraftLine(pr);
    expect(line).toContain('PR #1');
    expect(line).toContain('7d');
    expect(line).toContain('@bob');
  });

  it('falls back to unknown when user is missing', () => {
    const pr = { ...makePR(2, true, 3), user: undefined };
    expect(formatDraftLine(pr)).toContain('@unknown');
  });
});

describe('filterStaleDrafts', () => {
  it('returns drafts older than threshold', () => {
    const prs = [
      makePR(1, true, 6),
      makePR(2, true, 3),
      makePR(3, false, 10),
    ];
    const result = filterStaleDrafts(prs, 5);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it('uses default threshold of 5 days', () => {
    const prs = [makePR(1, true, 5), makePR(2, true, 4)];
    expect(filterStaleDrafts(prs)).toHaveLength(1);
  });

  it('returns empty array when no stale drafts', () => {
    expect(filterStaleDrafts([makePR(1, false, 10)], 5)).toHaveLength(0);
  });
});

describe('buildDraftAlertMessage', () => {
  it('returns null for empty list', () => {
    expect(buildDraftAlertMessage([], 'org/repo')).toBeNull();
  });

  it('includes repo name and PR count', () => {
    const prs = [makePR(1, true, 7), makePR(2, true, 9)];
    const msg = buildDraftAlertMessage(prs, 'org/repo');
    expect(msg).not.toBeNull();
    expect(msg.text).toContain('org/repo');
    const blockText = msg.blocks[0].text.text;
    expect(blockText).toContain('(2)');
    expect(blockText).toContain('PR #1');
    expect(blockText).toContain('PR #2');
  });
});
