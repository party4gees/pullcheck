const {
  getTrackingLabels,
  resolveLabelsForPR,
  diffLabels,
  STALE_LABEL,
  AWAITING_REVIEW_LABEL,
  REMINDER_SENT_LABEL,
} = require('./labelManager');

describe('getTrackingLabels', () => {
  it('returns all three tracking labels', () => {
    const labels = getTrackingLabels();
    expect(labels).toContain(STALE_LABEL);
    expect(labels).toContain(AWAITING_REVIEW_LABEL);
    expect(labels).toContain(REMINDER_SENT_LABEL);
    expect(labels).toHaveLength(3);
  });
});

describe('resolveLabelsForPR', () => {
  const config = { staleDays: 7 };

  it('applies stale label when PR exceeds stale threshold', () => {
    const pr = { daysSinceUpdate: 10, reviewRequested: false, reminderSent: false };
    expect(resolveLabelsForPR(pr, config)).toContain(STALE_LABEL);
  });

  it('applies awaiting-review when review requested and not yet stale', () => {
    const pr = { daysSinceUpdate: 2, reviewRequested: true, reminderSent: false };
    const labels = resolveLabelsForPR(pr, config);
    expect(labels).toContain(AWAITING_REVIEW_LABEL);
    expect(labels).not.toContain(STALE_LABEL);
  });

  it('applies reminder-sent when reminderSent is true', () => {
    const pr = { daysSinceUpdate: 3, reviewRequested: true, reminderSent: true };
    expect(resolveLabelsForPR(pr, config)).toContain(REMINDER_SENT_LABEL);
  });

  it('returns empty array for a fresh unreviewed PR', () => {
    const pr = { daysSinceUpdate: 1, reviewRequested: false, reminderSent: false };
    expect(resolveLabelsForPR(pr, config)).toHaveLength(0);
  });

  it('uses default staleDays of 7 when not in config', () => {
    const pr = { daysSinceUpdate: 8, reviewRequested: false, reminderSent: false };
    expect(resolveLabelsForPR(pr, {})).toContain(STALE_LABEL);
  });
});

describe('diffLabels', () => {
  it('identifies labels to add', () => {
    const { toAdd } = diffLabels([], [STALE_LABEL]);
    expect(toAdd).toEqual([STALE_LABEL]);
  });

  it('identifies tracking labels to remove', () => {
    const { toRemove } = diffLabels([STALE_LABEL], []);
    expect(toRemove).toContain(STALE_LABEL);
  });

  it('does not remove non-tracking labels', () => {
    const { toRemove } = diffLabels(['bug', STALE_LABEL], []);
    expect(toRemove).not.toContain('bug');
    expect(toRemove).toContain(STALE_LABEL);
  });

  it('returns empty diff when labels match', () => {
    const { toAdd, toRemove } = diffLabels([STALE_LABEL], [STALE_LABEL]);
    expect(toAdd).toHaveLength(0);
    expect(toRemove).toHaveLength(0);
  });
});
