const { daysSince, getStalePullRequests } = require('./stalePRDetector');

// Mock @octokit/rest
jest.mock('@octokit/rest', () => {
  const mockList = jest.fn();
  return {
    Octokit: jest.fn().mockImplementation(() => ({
      pulls: { list: mockList },
    })),
    __mockList: mockList,
  };
});

const { __mockList } = require('@octokit/rest');

describe('daysSince', () => {
  it('returns 0 for right now', () => {
    const now = new Date().toISOString();
    expect(daysSince(now)).toBeCloseTo(0, 1);
  });

  it('returns ~7 for a date 7 days ago', () => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    expect(daysSince(sevenDaysAgo)).toBeCloseTo(7, 0);
  });
});

describe('getStalePullRequests', () => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const yesterday = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString();

  const mockPRs = [
    {
      number: 42,
      title: 'Old feature',
      html_url: 'https://github.com/org/repo/pull/42',
      user: { login: 'alice' },
      updated_at: sevenDaysAgo,
      requested_reviewers: [{ login: 'bob' }],
    },
    {
      number: 43,
      title: 'Recent fix',
      html_url: 'https://github.com/org/repo/pull/43',
      user: { login: 'carol' },
      updated_at: yesterday,
      requested_reviewers: [],
    },
  ];

  beforeEach(() => {
    __mockList.mockResolvedValue({ data: mockPRs });
  });

  it('returns only PRs older than staleDays', async () => {
    const stale = await getStalePullRequests('org', 'repo', 7);
    expect(stale).toHaveLength(1);
    expect(stale[0].id).toBe(42);
  });

  it('maps PR fields correctly', async () => {
    const [pr] = await getStalePullRequests('org', 'repo', 7);
    expect(pr.author).toBe('alice');
    expect(pr.requestedReviewers).toEqual(['bob']);
    expect(pr.url).toBe('https://github.com/org/repo/pull/42');
  });

  it('returns empty array when no PRs are stale', async () => {
    const stale = await getStalePullRequests('org', 'repo', 30);
    expect(stale).toHaveLength(0);
  });

  it('handles API errors gracefully', async () => {
    __mockList.mockRejectedValue(new Error('API rate limit exceeded'));
    await expect(getStalePullRequests('org', 'repo', 7)).rejects.toThrow('API rate limit exceeded');
  });

  it('handles PRs with no requested reviewers', async () => {
    const [, pr] = await getStalePullRequests('org', 'repo', 0);
    expect(pr.requestedReviewers).toEqual([]);
  });
});
