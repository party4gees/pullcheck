const {
  createSnooze,
  isSnoozed,
  filterSnoozed,
  purgeExpiredSnoozes,
  DEFAULT_SNOOZE_DAYS,
} = require('./prSnoozeManager');

const NOW = new Date('2024-06-01T12:00:00Z');

describe('createSnooze', () => {
  it('creates a snooze entry expiring N days from now', () => {
    const result = createSnooze('org/repo#10', 3, NOW);
    expect(result.prId).toBe('org/repo#10');
    const expires = new Date(result.expiresAt);
    expect(expires.toISOString()).toBe('2024-06-04T12:00:00.000Z');
  });

  it('uses DEFAULT_SNOOZE_DAYS when days not provided', () => {
    const result = createSnooze('org/repo#11', undefined, NOW);
    const expires = new Date(result.expiresAt);
    const expected = new Date(NOW);
    expected.setDate(expected.getDate() + DEFAULT_SNOOZE_DAYS);
    expect(expires.toISOString()).toBe(expected.toISOString());
  });
});

describe('isSnoozed', () => {
  it('returns true when expiry is in the future', () => {
    const entry = { expiresAt: '2024-06-05T00:00:00Z' };
    expect(isSnoozed(entry, NOW)).toBe(true);
  });

  it('returns false when expiry is in the past', () => {
    const entry = { expiresAt: '2024-05-30T00:00:00Z' };
    expect(isSnoozed(entry, NOW)).toBe(false);
  });

  it('returns false for null or missing entry', () => {
    expect(isSnoozed(null, NOW)).toBe(false);
    expect(isSnoozed(undefined, NOW)).toBe(false);
    expect(isSnoozed({}, NOW)).toBe(false);
  });
});

describe('filterSnoozed', () => {
  const prs = [
    { id: 'org/repo#1' },
    { id: 'org/repo#2' },
    { id: 'org/repo#3' },
  ];

  it('removes PRs that are currently snoozed', () => {
    const snoozeMap = {
      'org/repo#2': { expiresAt: '2024-06-10T00:00:00Z' },
    };
    const result = filterSnoozed(prs, snoozeMap, NOW);
    expect(result.map((p) => p.id)).toEqual(['org/repo#1', 'org/repo#3']);
  });

  it('keeps PRs with expired snoozes', () => {
    const snoozeMap = {
      'org/repo#1': { expiresAt: '2024-05-01T00:00:00Z' },
    };
    const result = filterSnoozed(prs, snoozeMap, NOW);
    expect(result).toHaveLength(3);
  });

  it('returns all PRs when snoozeMap is empty', () => {
    expect(filterSnoozed(prs, {}, NOW)).toHaveLength(3);
  });
});

describe('purgeExpiredSnoozes', () => {
  it('removes expired entries and keeps active ones', () => {
    const snoozeMap = {
      'org/repo#1': { expiresAt: '2024-05-30T00:00:00Z' }, // expired
      'org/repo#2': { expiresAt: '2024-06-10T00:00:00Z' }, // active
    };
    const result = purgeExpiredSnoozes(snoozeMap, NOW);
    expect(Object.keys(result)).toEqual(['org/repo#2']);
  });

  it('returns empty object when all snoozes are expired', () => {
    const snoozeMap = {
      'org/repo#1': { expiresAt: '2024-01-01T00:00:00Z' },
    };
    expect(purgeExpiredSnoozes(snoozeMap, NOW)).toEqual({});
  });

  it('handles empty map gracefully', () => {
    expect(purgeExpiredSnoozes({}, NOW)).toEqual({});
  });
});
