const { formatConflictLine, buildConflictAlertMessage } = require('./prConflictNotifier');

function makePR(overrides = {}) {
  return {
    title: 'Fix login bug',
    url: 'https://github.com/org/repo/pull/42',
    author: 'alice',
    conflictStatus: { hasConflict: false, isBehindBase: false },
    ...overrides,
  };
}

describe('formatConflictLine', () => {
  test('shows conflict tag when hasConflict is true', () => {
    const pr = makePR({ conflictStatus: { hasConflict: true, isBehindBase: false } });
    const line = formatConflictLine(pr);
    expect(line).toContain('merge conflict');
    expect(line).toContain('Fix login bug');
    expect(line).toContain('alice');
  });

  test('shows behind base tag when isBehindBase is true', () => {
    const pr = makePR({ conflictStatus: { hasConflict: false, isBehindBase: true } });
    const line = formatConflictLine(pr);
    expect(line).toContain('behind base');
  });

  test('shows both tags when both flags are true', () => {
    const pr = makePR({ conflictStatus: { hasConflict: true, isBehindBase: true } });
    const line = formatConflictLine(pr);
    expect(line).toContain('merge conflict');
    expect(line).toContain('behind base');
  });

  test('shows no tags when both flags are false', () => {
    const pr = makePR();
    const line = formatConflictLine(pr);
    expect(line).not.toContain('merge conflict');
    expect(line).not.toContain('behind base');
  });

  test('includes PR url as slack link', () => {
    const pr = makePR({ conflictStatus: { hasConflict: true, isBehindBase: false } });
    const line = formatConflictLine(pr);
    expect(line).toContain('<https://github.com/org/repo/pull/42|Fix login bug>');
  });
});

describe('buildConflictAlertMessage', () => {
  test('returns empty string for empty array', () => {
    expect(buildConflictAlertMessage([])).toBe('');
  });

  test('returns empty string for null input', () => {
    expect(buildConflictAlertMessage(null)).toBe('');
  });

  test('includes repo name in header when provided', () => {
    const pr = makePR({ conflictStatus: { hasConflict: true, isBehindBase: false } });
    const msg = buildConflictAlertMessage([pr], 'org/repo');
    expect(msg).toContain('org/repo');
    expect(msg).toContain('Conflict Alert');
  });

  test('includes count summary at the end', () => {
    const prs = [
      makePR({ title: 'PR 1', conflictStatus: { hasConflict: true, isBehindBase: false } }),
      makePR({ title: 'PR 2', conflictStatus: { hasConflict: false, isBehindBase: true } }),
    ];
    const msg = buildConflictAlertMessage(prs);
    expect(msg).toContain('2 PR(s)');
  });

  test('lists all PR lines in message', () => {
    const prs = [
      makePR({ title: 'Alpha', conflictStatus: { hasConflict: true, isBehindBase: false } }),
      makePR({ title: 'Beta', conflictStatus: { hasConflict: false, isBehindBase: true } }),
    ];
    const msg = buildConflictAlertMessage(prs);
    expect(msg).toContain('Alpha');
    expect(msg).toContain('Beta');
  });
});
