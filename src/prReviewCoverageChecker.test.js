const {
  hasReviewerAssigned,
  hasEnoughApprovals,
  filterUncoveredPRs,
  annotateWithCoverage,
} = require('./prReviewCoverageChecker');

function makePR(overrides = {}) {
  return {
    number: 1,
    title: 'Test PR',
    requested_reviewers: [],
    reviews: [],
    ...overrides,
  };
}

describe('hasReviewerAssigned', () => {
  it('returns false when no reviewers assigned', () => {
    expect(hasReviewerAssigned(makePR())).toBe(false);
  });

  it('returns true when at least one reviewer assigned', () => {
    const pr = makePR({ requested_reviewers: [{ login: 'alice' }] });
    expect(hasReviewerAssigned(pr)).toBe(true);
  });

  it('returns false if requested_reviewers is missing', () => {
    expect(hasReviewerAssigned({ number: 2 })).toBe(false);
  });
});

describe('hasEnoughApprovals', () => {
  it('returns false with no approvals', () => {
    expect(hasEnoughApprovals(makePR())).toBe(false);
  });

  it('returns true when approval count meets minimum', () => {
    const pr = makePR({ reviews: [{ state: 'APPROVED' }] });
    expect(hasEnoughApprovals(pr, 1)).toBe(true);
  });

  it('returns false when approval count is below minimum', () => {
    const pr = makePR({ reviews: [{ state: 'APPROVED' }] });
    expect(hasEnoughApprovals(pr, 2)).toBe(false);
  });

  it('ignores non-approval reviews', () => {
    const pr = makePR({ reviews: [{ state: 'CHANGES_REQUESTED' }] });
    expect(hasEnoughApprovals(pr, 1)).toBe(false);
  });
});

describe('filterUncoveredPRs', () => {
  it('returns only PRs without reviewers', () => {
    const prs = [
      makePR({ number: 1 }),
      makePR({ number: 2, requested_reviewers: [{ login: 'bob' }] }),
      makePR({ number: 3 }),
    ];
    const result = filterUncoveredPRs(prs);
    expect(result.map(p => p.number)).toEqual([1, 3]);
  });

  it('returns empty array when all PRs are covered', () => {
    const prs = [makePR({ requested_reviewers: [{ login: 'alice' }] })];
    expect(filterUncoveredPRs(prs)).toHaveLength(0);
  });
});

describe('annotateWithCoverage', () => {
  it('annotates PR with coverage metadata', () => {
    const pr = makePR({
      requested_reviewers: [{ login: 'alice' }],
      reviews: [{ state: 'APPROVED' }],
    });
    const [annotated] = annotateWithCoverage([pr], 1);
    expect(annotated.coverage.hasReviewer).toBe(true);
    expect(annotated.coverage.approved).toBe(true);
    expect(annotated.coverage.reviewerCount).toBe(1);
    expect(annotated.coverage.approvalCount).toBe(1);
  });

  it('marks uncovered PR correctly', () => {
    const [annotated] = annotateWithCoverage([makePR()]);
    expect(annotated.coverage.hasReviewer).toBe(false);
    expect(annotated.coverage.approved).toBe(false);
  });
});
