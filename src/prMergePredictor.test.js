const {
  predictMergeLikelihood,
  mergeTier,
  annotatePRsWithPrediction,
} = require('./prMergePredictor');

describe('predictMergeLikelihood', () => {
  it('returns 0 for a bare PR with no signals', () => {
    expect(predictMergeLikelihood({})).toBe(0);
  });

  it('awards full approvals weight for 2+ approvals', () => {
    const score = predictMergeLikelihood({ approvals: 2 });
    expect(score).toBe(30);
  });

  it('awards half approvals weight for 1 approval', () => {
    const score = predictMergeLikelihood({ approvals: 1 });
    expect(score).toBe(15);
  });

  it('adds recent comment bonus within 1 day', () => {
    const score = predictMergeLikelihood({}, { daysSinceLastComment: 0 });
    expect(score).toBe(15);
  });

  it('adds partial comment bonus for 2-3 days', () => {
    const score = predictMergeLikelihood({}, { daysSinceLastComment: 2 });
    expect(score).toBe(7);
  });

  it('adds reviewer bonus when reviewers assigned', () => {
    const score = predictMergeLikelihood({ reviewers: ['alice'] });
    expect(score).toBe(10);
  });

  it('adds full age bonus for PR aged <= 3 days', () => {
    const score = predictMergeLikelihood({ ageDays: 2 });
    expect(score).toBe(20);
  });

  it('adds CI passing bonus', () => {
    const score = predictMergeLikelihood({}, { ciPassing: true });
    expect(score).toBe(25);
  });

  it('caps score at 100', () => {
    const pr = { approvals: 3, reviewers: ['x'], ageDays: 1 };
    const score = predictMergeLikelihood(pr, { daysSinceLastComment: 0, ciPassing: true });
    expect(score).toBe(100);
  });
});

describe('mergeTier', () => {
  it('returns high for score >= 75', () => expect(mergeTier(80)).toBe('high'));
  it('returns medium for score 45–74', () => expect(mergeTier(50)).toBe('medium'));
  it('returns low for score < 45', () => expect(mergeTier(30)).toBe('low'));
});

describe('annotatePRsWithPrediction', () => {
  it('annotates each PR with mergeScore and mergeTier', () => {
    const prs = [{ id: 1, approvals: 2, ageDays: 1 }];
    const result = annotatePRsWithPrediction(prs, () => ({ ciPassing: true }));
    expect(result[0].mergeScore).toBeGreaterThan(0);
    expect(['high', 'medium', 'low']).toContain(result[0].mergeTier);
  });

  it('does not mutate original PR objects', () => {
    const pr = { id: 2 };
    annotatePRsWithPrediction([pr]);
    expect(pr.mergeScore).toBeUndefined();
  });
});
