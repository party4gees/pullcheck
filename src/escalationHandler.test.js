const {
  processEscalations,
  buildEscalationSlackMessage,
  collectEscalationLabels,
} = require('./escalationHandler');

const config = { escalationDays: 5, escalationLabel: 'needs-escalation' };
const escalationMap = { alice: 'bob', charlie: 'diana' };

const makePR = (overrides = {}) => ({
  number: 10,
  title: 'Add feature X',
  reviewers: ['alice'],
  ...overrides,
});

describe('buildEscalationSlackMessage', () => {
  it('includes PR number, title, staleDays, and target mentions', () => {
    const ctx = { prNumber: 10, prTitle: 'Add feature X', staleDays: 7, targets: ['bob'], label: 'needs-escalation' };
    const msg = buildEscalationSlackMessage(ctx);
    expect(msg).toContain('PR #10');
    expect(msg).toContain('Add feature X');
    expect(msg).toContain('7 days');
    expect(msg).toContain('@bob');
  });

  it('includes multiple targets separated by commas', () => {
    const ctx = { prNumber: 2, prTitle: 'Fix', staleDays: 6, targets: ['bob', 'diana'], label: 'needs-escalation' };
    const msg = buildEscalationSlackMessage(ctx);
    expect(msg).toContain('@bob, @diana');
  });
});

describe('processEscalations', () => {
  it('returns an action for an eligible PR with targets', () => {
    const stalePRs = [{ pr: makePR(), staleDays: 7 }];
    const actions = processEscalations(stalePRs, config, escalationMap);
    expect(actions).toHaveLength(1);
    expect(actions[0].ctx.prNumber).toBe(10);
    expect(actions[0].message).toContain('@bob');
  });

  it('skips PRs that are not stale enough', () => {
    const stalePRs = [{ pr: makePR(), staleDays: 2 }];
    const actions = processEscalations(stalePRs, config, escalationMap);
    expect(actions).toHaveLength(0);
  });

  it('skips PRs with no escalation targets', () => {
    const stalePRs = [{ pr: makePR({ reviewers: ['unknown'] }), staleDays: 7 }];
    const actions = processEscalations(stalePRs, config, escalationMap);
    expect(actions).toHaveLength(0);
  });

  it('handles multiple PRs correctly', () => {
    const stalePRs = [
      { pr: makePR({ number: 1, reviewers: ['alice'] }), staleDays: 6 },
      { pr: makePR({ number: 2, reviewers: ['charlie'] }), staleDays: 3 },
      { pr: makePR({ number: 3, reviewers: ['charlie'] }), staleDays: 8 },
    ];
    const actions = processEscalations(stalePRs, config, escalationMap);
    expect(actions).toHaveLength(2);
    expect(actions.map(a => a.ctx.prNumber)).toEqual([1, 3]);
  });
});

describe('collectEscalationLabels', () => {
  it('returns unique labels from actions', () => {
    const actions = [
      { ctx: { label: 'needs-escalation' } },
      { ctx: { label: 'needs-escalation' } },
      { ctx: { label: 'urgent' } },
    ];
    expect(collectEscalationLabels(actions)).toEqual(['needs-escalation', 'urgent']);
  });

  it('returns empty array for no actions', () => {
    expect(collectEscalationLabels([])).toEqual([]);
  });
});
