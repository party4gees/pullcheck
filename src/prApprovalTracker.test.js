const {
  getApprovals,
  getChangeRequests,
  isFullyApproved,
  annotateWithApprovalStatus,
  filterUnapproved,
} = require('./prApprovalTracker');

function makePR(reviews = []) {
  return { number: 1, title: 'Test PR', reviews };
}

const approved = (login) => ({ state: 'APPROVED', user: { login } });
const changesReq = (login) => ({ state: 'CHANGES_REQUESTED', user: { login } });
const commented = (login) => ({ state: 'COMMENTED', user: { login } });

describe('getApprovals', () => {
  it('returns only APPROVED reviews', () => {
    const pr = makePR([approved('alice'), changesReq('bob'), commented('carol')]);
    expect(getApprovals(pr)).toHaveLength(1);
    expect(getApprovals(pr)[0].user.login).toBe('alice');
  });

  it('returns empty array when no reviews', () => {
    expect(getApprovals(makePR())).toEqual([]);
  });
});

describe('getChangeRequests', () => {
  it('returns only CHANGES_REQUESTED reviews', () => {
    const pr = makePR([approved('alice'), changesReq('bob')]);
    expect(getChangeRequests(pr)).toHaveLength(1);
    expect(getChangeRequests(pr)[0].user.login).toBe('bob');
  });

  it('returns empty when none', () => {
    expect(getChangeRequests(makePR([approved('alice')]))).toEqual([]);
  });
});

describe('isFullyApproved', () => {
  it('returns true when approvals meet threshold', () => {
    const pr = makePR([approved('alice'), approved('bob')]);
    expect(isFullyApproved(pr, 2)).toBe(true);
  });

  it('returns false when below threshold', () => {
    const pr = makePR([approved('alice')]);
    expect(isFullyApproved(pr, 2)).toBe(false);
  });

  it('uses default threshold of 1', () => {
    expect(isFullyApproved(makePR([approved('alice')]))).toBe(true);
    expect(isFullyApproved(makePR())).toBe(false);
  });
});

describe('annotateWithApprovalStatus', () => {
  it('annotates PR with approval metadata', () => {
    const pr = makePR([approved('alice'), changesReq('bob')]);
    const [result] = annotateWithApprovalStatus([pr], 1);
    expect(result.approvalCount).toBe(1);
    expect(result.approvedBy).toEqual(['alice']);
    expect(result.changeRequestCount).toBe(1);
    expect(result.fullyApproved).toBe(true);
  });

  it('marks fullyApproved false when threshold not met', () => {
    const pr = makePR([approved('alice')]);
    const [result] = annotateWithApprovalStatus([pr], 2);
    expect(result.fullyApproved).toBe(false);
  });

  it('handles PRs with no reviews', () => {
    const [result] = annotateWithApprovalStatus([makePR()]);
    expect(result.approvalCount).toBe(0);
    expect(result.approvedBy).toEqual([]);
    expect(result.fullyApproved).toBe(false);
  });
});

describe('filterUnapproved', () => {
  it('filters out fully approved PRs', () => {
    const prs = [
      makePR([approved('alice')]),
      makePR([]),
      makePR([approved('bob'), approved('carol')]),
    ];
    const result = filterUnapproved(prs, 1);
    expect(result).toHaveLength(1);
  });

  it('returns all PRs when none are approved', () => {
    const prs = [makePR(), makePR()];
    expect(filterUnapproved(prs)).toHaveLength(2);
  });
});
