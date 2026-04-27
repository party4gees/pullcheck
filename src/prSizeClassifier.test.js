const { classifySize, sizeEmoji, annotateWithSize, filterBySize } = require('./prSizeClassifier');

function makePR(additions, deletions, changed_files) {
  return { number: 1, title: 'Test PR', additions, deletions, changed_files };
}

describe('classifySize', () => {
  test('classifies xs PR', () => {
    expect(classifySize(makePR(5, 3, 1))).toBe('xs');
  });

  test('classifies small PR', () => {
    expect(classifySize(makePR(30, 10, 4))).toBe('small');
  });

  test('classifies medium PR', () => {
    expect(classifySize(makePR(150, 60, 8))).toBe('medium');
  });

  test('classifies large PR', () => {
    expect(classifySize(makePR(600, 200, 20))).toBe('large');
  });

  test('classifies xl PR', () => {
    expect(classifySize(makePR(800, 400, 30))).toBe('xl');
  });

  test('defaults missing fields to 0', () => {
    expect(classifySize({})).toBe('xs');
  });
});

describe('sizeEmoji', () => {
  test('returns correct emoji for each size', () => {
    expect(sizeEmoji('xs')).toBe('🟢');
    expect(sizeEmoji('small')).toBe('🔵');
    expect(sizeEmoji('medium')).toBe('🟡');
    expect(sizeEmoji('large')).toBe('🟠');
    expect(sizeEmoji('xl')).toBe('🔴');
  });

  test('returns fallback for unknown size', () => {
    expect(sizeEmoji('unknown')).toBe('⚪');
  });
});

describe('annotateWithSize', () => {
  test('adds size and sizeEmoji to each PR', () => {
    const prs = [makePR(5, 2, 1), makePR(300, 100, 12)];
    const result = annotateWithSize(prs);
    expect(result[0].size).toBe('xs');
    expect(result[0].sizeEmoji).toBe('🟢');
    expect(result[1].size).toBe('medium');
    expect(result[1].sizeEmoji).toBe('🟡');
  });

  test('does not mutate original PRs', () => {
    const pr = makePR(5, 2, 1);
    annotateWithSize([pr]);
    expect(pr.size).toBeUndefined();
  });
});

describe('filterBySize', () => {
  test('returns only PRs matching the given size', () => {
    const prs = [makePR(5, 2, 1), makePR(30, 10, 4), makePR(5, 3, 1)];
    const result = filterBySize(prs, 'xs');
    expect(result).toHaveLength(2);
  });

  test('returns empty array if no match', () => {
    const prs = [makePR(5, 2, 1)];
    expect(filterBySize(prs, 'xl')).toHaveLength(0);
  });
});
