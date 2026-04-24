const { getOpenPullRequests, getRequestedReviewers } = require('./githubClient');

// Mock @octokit/rest before requiring the module
jest.mock('@octokit/rest', () => {
  const mockList = jest.fn();
  const mockListReviewers = jest.fn();

  return {
    Octokit: jest.fn().mockImplementation(() => ({
      pulls: {
        list: mockList,
        listRequestedReviewers: mockListReviewers,
      },
    })),
    __mockList: mockList,
    __mockListReviewers: mockListReviewers,
  };
});

const { __mockList, __mockListReviewers } = require('@octokit/rest');

describe('githubClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getOpenPullRequests', () => {
    it('returns all open PRs across pages', async () => {
      __mockList
        .mockResolvedValueOnce({ data: [{ id: 1, title: 'PR one' }, { id: 2, title: 'PR two' }] })
        .mockResolvedValueOnce({ data: [] });

      const result = await getOpenPullRequests('myorg', 'myrepo');

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('PR one');
      expect(__mockList).toHaveBeenCalledTimes(2);
    });

    it('returns empty array when there are no open PRs', async () => {
      __mockList.mockResolvedValueOnce({ data: [] });

      const result = await getOpenPullRequests('myorg', 'myrepo');

      expect(result).toEqual([]);
      expect(__mockList).toHaveBeenCalledTimes(1);
    });
  });

  describe('getRequestedReviewers', () => {
    it('returns combined list of user logins and team slugs', async () => {
      __mockListReviewers.mockResolvedValueOnce({
        data: {
          users: [{ login: 'alice' }, { login: 'bob' }],
          teams: [{ slug: 'frontend-team' }],
        },
      });

      const result = await getRequestedReviewers('myorg', 'myrepo', 42);

      expect(result).toEqual(['alice', 'bob', 'frontend-team']);
    });

    it('returns empty array when no reviewers are requested', async () => {
      __mockListReviewers.mockResolvedValueOnce({
        data: { users: [], teams: [] },
      });

      const result = await getRequestedReviewers('myorg', 'myrepo', 99);

      expect(result).toEqual([]);
    });
  });
});
