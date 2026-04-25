const {
  formatAge,
  getStalenessLevel,
  stalenessEmoji,
  formatPRAgeSummary,
} = require('./prAgeFormatter');

describe('formatAge', () => {
  test('returns "less than a day" for 0 days', () => {
    expect(formatAge(0)).toBe('less than a day');
  });

  test('returns "1 day" for exactly 1 day', () => {
    expect(formatAge(1)).toBe('1 day');
  });

  test('returns "N days" for 2-6 days', () => {
    expect(formatAge(3)).toBe('3 days');
    expect(formatAge(6)).toBe('6 days');
  });

  test('returns weeks only when no remainder', () => {
    expect(formatAge(7)).toBe('1 week');
    expect(formatAge(14)).toBe('2 weeks');
  });

  test('returns weeks and days when remainder exists', () => {
    expect(formatAge(8)).toBe('1 week, 1 day');
    expect(formatAge(10)).toBe('1 week, 3 days');
    expect(formatAge(16)).toBe('2 weeks, 2 days');
  });
});

describe('getStalenessLevel', () => {
  const thresholds = { warn: 3, critical: 7 };

  test('returns fresh for days below warn threshold', () => {
    expect(getStalenessLevel(1, thresholds)).toBe('fresh');
    expect(getStalenessLevel(2, thresholds)).toBe('fresh');
  });

  test('returns warn for days at or above warn threshold', () => {
    expect(getStalenessLevel(3, thresholds)).toBe('warn');
    expect(getStalenessLevel(6, thresholds)).toBe('warn');
  });

  test('returns critical for days at or above critical threshold', () => {
    expect(getStalenessLevel(7, thresholds)).toBe('critical');
    expect(getStalenessLevel(20, thresholds)).toBe('critical');
  });

  test('uses default thresholds when not provided', () => {
    expect(getStalenessLevel(2)).toBe('fresh');
    expect(getStalenessLevel(4)).toBe('warn');
    expect(getStalenessLevel(8)).toBe('critical');
  });
});

describe('stalenessEmoji', () => {
  test('returns correct emoji per level', () => {
    expect(stalenessEmoji('fresh')).toBe('🟢');
    expect(stalenessEmoji('warn')).toBe('🟡');
    expect(stalenessEmoji('critical')).toBe('🔴');
  });

  test('returns fallback emoji for unknown level', () => {
    expect(stalenessEmoji('unknown')).toBe('⚪');
  });
});

describe('formatPRAgeSummary', () => {
  const pr = { number: 42, title: 'Add dark mode', updatedAt: '2024-01-01' };

  test('formats a warn-level PR correctly', () => {
    const result = formatPRAgeSummary(pr, 4, { warn: 3, critical: 7 });
    expect(result).toBe('🟡 *#42* — Add dark mode (idle for 4 days)');
  });

  test('formats a critical-level PR correctly', () => {
    const result = formatPRAgeSummary(pr, 10, { warn: 3, critical: 7 });
    expect(result).toBe('🔴 *#42* — Add dark mode (idle for 1 week, 3 days)');
  });

  test('formats a fresh PR correctly', () => {
    const result = formatPRAgeSummary(pr, 1, { warn: 3, critical: 7 });
    expect(result).toBe('🟢 *#42* — Add dark mode (idle for 1 day)');
  });
});
