const {
  shouldEscalate,
  resolveEscalationTarget,
  buildEscalationContext,
  DEFAULT_ESCALATION_DAYS,
  DEFAULT_ESCALATION_LABEL,
} = require('./escalationPolicy');

describe('shouldEscalate', () => {
  it('returns false when staleDays is below threshold', () => {
    expect(shouldEscalate(3, { escalationDays: 5 })).toBe(false);
  });

  it('returns true when staleDays equals threshold', () => {
    expect(shouldEscalate(5, { escalationDays: 5 })).toBe(true);
  });

  it('returns true when staleDays exceeds threshold', () => {
    expect(shouldEscalate(8, { escalationDays: 5 })).toBe(true);
  });

  it('uses DEFAULT_ESCALATION_DAYS when config omits escalationDays', () => {
    expect(shouldEscalate(DEFAULT_ESCALATION_DAYS, {})).toBe(true);
    expect(shouldEscalate(DEFAULT_ESCALATION_DAYS - 1, {})).toBe(false);
  });
});

describe('resolveEscalationTarget', () => {
  const map = { alice: 'bob', charlie: 'diana' };

  it('returns escalation target for known reviewer', () => {
    expect(resolveEscalationTarget('alice', map)).toBe('bob');
  });

  it('returns null for unknown reviewer', () => {
    expect(resolveEscalationTarget('eve', map)).toBeNull();
  });

  it('returns null when reviewer is falsy', () => {
    expect(resolveEscalationTarget(null, map)).toBeNull();
    expect(resolveEscalationTarget('', map)).toBeNull();
  });

  it('returns null when map is empty', () => {
    expect(resolveEscalationTarget('alice', {})).toBeNull();
  });
});

describe('buildEscalationContext', () => {
  const pr = { number: 42, title: 'Fix bug', reviewers: ['alice', 'charlie'] };
  const config = { escalationDays: 5, escalationLabel: 'urgent-review' };
  const escalationMap = { alice: 'bob', charlie: 'diana' };

  it('builds context with eligible=true when stale enough', () => {
    const ctx = buildEscalationContext(pr, 7, config, escalationMap);
    expect(ctx.eligible).toBe(true);
    expect(ctx.targets).toEqual(['bob', 'diana']);
    expect(ctx.label).toBe('urgent-review');
    expect(ctx.prNumber).toBe(42);
  });

  it('builds context with eligible=false when not stale enough', () => {
    const ctx = buildEscalationContext(pr, 2, config, escalationMap);
    expect(ctx.eligible).toBe(false);
  });

  it('uses DEFAULT_ESCALATION_LABEL when config omits escalationLabel', () => {
    const ctx = buildEscalationContext(pr, 6, {}, escalationMap);
    expect(ctx.label).toBe(DEFAULT_ESCALATION_LABEL);
  });

  it('returns empty targets when no escalation map entries match', () => {
    const ctx = buildEscalationContext(pr, 6, config, {});
    expect(ctx.targets).toEqual([]);
  });

  it('handles PR with no reviewers gracefully', () => {
    const ctx = buildEscalationContext({ number: 1, title: 'empty' }, 6, config, escalationMap);
    expect(ctx.targets).toEqual([]);
  });
});
