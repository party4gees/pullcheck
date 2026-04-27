const {
  makeDedupeKey,
  isDuplicate,
  recordSent,
  filterDuplicates,
  pruneSentLog,
} = require('./prDeduplicator');

const pr = { number: 42, repo: 'org/repo' };
const NOW = new Date('2024-06-01T12:00:00Z');

describe('makeDedupeKey', () => {
  it('combines repo, number, and type', () => {
    expect(makeDedupeKey(pr, 'stale')).toBe('org/repo#42:stale');
  });

  it('falls back to unknown when repo is missing', () => {
    expect(makeDedupeKey({ number: 7 }, 'reminder')).toBe('unknown#7:reminder');
  });

  it('uses repository field if repo is absent', () => {
    expect(makeDedupeKey({ number: 1, repository: 'org/x' }, 'escalation')).toBe('org/x#1:escalation');
  });
});

describe('isDuplicate', () => {
  it('returns false when key is not in log', () => {
    expect(isDuplicate({}, 'org/repo#42:stale', 24, NOW)).toBe(false);
  });

  it('returns true when last sent is within cooldown', () => {
    const log = { 'org/repo#42:stale': new Date('2024-06-01T10:00:00Z').toISOString() };
    expect(isDuplicate(log, 'org/repo#42:stale', 24, NOW)).toBe(true);
  });

  it('returns false when last sent is outside cooldown', () => {
    const log = { 'org/repo#42:stale': new Date('2024-05-30T10:00:00Z').toISOString() };
    expect(isDuplicate(log, 'org/repo#42:stale', 24, NOW)).toBe(false);
  });
});

describe('recordSent', () => {
  it('adds a new key to the log', () => {
    const log = recordSent({}, 'org/repo#42:stale', NOW);
    expect(log['org/repo#42:stale']).toBe(NOW.toISOString());
  });

  it('does not mutate the original log', () => {
    const original = {};
    recordSent(original, 'key', NOW);
    expect(original).toEqual({});
  });
});

describe('filterDuplicates', () => {
  const log = { 'org/repo#42:stale': new Date('2024-06-01T11:00:00Z').toISOString() };
  const notifications = [
    { pr, type: 'stale' },
    { pr, type: 'reminder' },
  ];

  it('filters out already-sent notifications', () => {
    const result = filterDuplicates(notifications, log, 24, NOW);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('reminder');
  });

  it('returns all when log is empty', () => {
    expect(filterDuplicates(notifications, {}, 24, NOW)).toHaveLength(2);
  });
});

describe('pruneSentLog', () => {
  it('removes entries older than retention window', () => {
    const log = {
      old: new Date('2024-05-29T00:00:00Z').toISOString(),
      fresh: new Date('2024-06-01T11:00:00Z').toISOString(),
    };
    const pruned = pruneSentLog(log, 48, NOW);
    expect(pruned.old).toBeUndefined();
    expect(pruned.fresh).toBeDefined();
  });

  it('returns empty object when all entries are stale', () => {
    const log = { a: new Date('2024-01-01').toISOString() };
    expect(pruneSentLog(log, 1, NOW)).toEqual({});
  });
});
