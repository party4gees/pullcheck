const {
  shouldSendReminder,
  filterDueReminders,
  getReminderLabel,
} = require('./reminderScheduler');

describe('shouldSendReminder', () => {
  const intervals = [1, 3, 7, 14];

  test('returns true when daysStale matches an interval', () => {
    expect(shouldSendReminder(1, intervals)).toBe(true);
    expect(shouldSendReminder(7, intervals)).toBe(true);
    expect(shouldSendReminder(14, intervals)).toBe(true);
  });

  test('returns false when daysStale does not match any interval', () => {
    expect(shouldSendReminder(2, intervals)).toBe(false);
    expect(shouldSendReminder(5, intervals)).toBe(false);
    expect(shouldSendReminder(0, intervals)).toBe(false);
  });

  test('returns false for empty intervals array', () => {
    expect(shouldSendReminder(3, [])).toBe(false);
  });

  test('returns false when intervals is not an array', () => {
    expect(shouldSendReminder(3, null)).toBe(false);
    expect(shouldSendReminder(3, undefined)).toBe(false);
  });
});

describe('filterDueReminders', () => {
  const intervals = [1, 3, 7];
  const stalePRs = [
    { number: 10, daysStale: 1 },
    { number: 11, daysStale: 2 },
    { number: 12, daysStale: 3 },
    { number: 13, daysStale: 5 },
    { number: 14, daysStale: 7 },
  ];

  test('returns only PRs whose daysStale matches an interval', () => {
    const result = filterDueReminders(stalePRs, intervals);
    expect(result.map((p) => p.number)).toEqual([10, 12, 14]);
  });

  test('returns empty array when no PRs match', () => {
    const result = filterDueReminders(
      [{ number: 99, daysStale: 99 }],
      intervals
    );
    expect(result).toEqual([]);
  });

  test('returns empty array when stalePRs is not an array', () => {
    expect(filterDueReminders(null, intervals)).toEqual([]);
  });
});

describe('getReminderLabel', () => {
  const intervals = [1, 3, 7, 14];

  test('returns correct label for first escalation', () => {
    expect(getReminderLabel(1, intervals)).toBe(
      'Day 1 reminder (escalation 1 of 4)'
    );
  });

  test('returns correct label for last escalation', () => {
    expect(getReminderLabel(14, intervals)).toBe(
      'Day 14 reminder (escalation 4 of 4)'
    );
  });

  test('returns No reminder when day is not in intervals', () => {
    expect(getReminderLabel(5, intervals)).toBe('No reminder');
  });
});
