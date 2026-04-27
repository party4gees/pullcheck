const { formatSizeLine, filterOversized, buildSizeAlertMessage } = require('./sizeNotifier');

function makePR(additions, deletions, changed_files, size = null) {
  return {
    number: 42,
    title: 'Big refactor',
    html_url: 'https://github.com/org/repo/pull/42',
    additions,
    deletions,
    changed_files,
    ...(size ? { size } : {}),
  };
}

describe('formatSizeLine', () => {
  test('formats a large PR line', () => {
    const pr = { ...makePR(600, 200, 20), size: 'large', sizeEmoji: '🟠' };
    const line = formatSizeLine(pr);
    expect(line).toContain('#42');
    expect(line).toContain('LARGE');
    expect(line).toContain('800 lines');
    expect(line).toContain('20 files');
    expect(line).toContain('🟠');
  });

  test('computes size inline if not pre-annotated', () => {
    const pr = makePR(800, 400, 30);
    const line = formatSizeLine(pr);
    expect(line).toContain('XL');
  });
});

describe('filterOversized', () => {
  test('keeps only large and xl PRs', () => {
    const prs = [
      { ...makePR(5, 2, 1), size: 'xs' },
      { ...makePR(600, 200, 20), size: 'large' },
      { ...makePR(800, 400, 30), size: 'xl' },
      { ...makePR(30, 10, 4), size: 'small' },
    ];
    const result = filterOversized(prs);
    expect(result).toHaveLength(2);
  });

  test('classifies inline when size not set', () => {
    const prs = [makePR(800, 400, 30), makePR(5, 2, 1)];
    expect(filterOversized(prs)).toHaveLength(1);
  });

  test('returns empty array when no oversized PRs', () => {
    expect(filterOversized([makePR(5, 2, 1)])).toHaveLength(0);
  });
});

describe('buildSizeAlertMessage', () => {
  test('returns null when no oversized PRs', () => {
    expect(buildSizeAlertMessage([makePR(5, 2, 1)], 'my-repo')).toBeNull();
  });

  test('includes repo name and PR count in header', () => {
    const prs = [{ ...makePR(800, 400, 30), size: 'xl' }];
    const msg = buildSizeAlertMessage(prs, 'my-repo');
    expect(msg).toContain('my-repo');
    expect(msg).toContain('1 PR');
  });

  test('uses plural for multiple PRs', () => {
    const prs = [
      { ...makePR(800, 400, 30), size: 'xl' },
      { ...makePR(600, 200, 20), size: 'large' },
    ];
    const msg = buildSizeAlertMessage(prs, 'my-repo');
    expect(msg).toContain('2 PRs');
  });

  test('includes formatted lines for each oversized PR', () => {
    const prs = [{ ...makePR(800, 400, 30), size: 'xl', sizeEmoji: '🔴' }];
    const msg = buildSizeAlertMessage(prs, 'my-repo');
    expect(msg).toContain('#42');
  });
});
