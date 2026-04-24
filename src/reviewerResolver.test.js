const { loadReviewerMap, resolveReviewer, resolveReviewers } = require('./reviewerResolver');

describe('loadReviewerMap', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns empty object when REVIEWER_MAP is not set', () => {
    delete process.env.REVIEWER_MAP;
    expect(loadReviewerMap()).toEqual({});
  });

  it('parses REVIEWER_MAP from environment', () => {
    process.env.REVIEWER_MAP = JSON.stringify({ octocat: 'U012AB3CD' });
    expect(loadReviewerMap()).toEqual({ octocat: 'U012AB3CD' });
  });

  it('returns empty object and warns on invalid JSON', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    process.env.REVIEWER_MAP = 'not-valid-json';
    expect(loadReviewerMap()).toEqual({});
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('prefers overrideMap over environment variable', () => {
    process.env.REVIEWER_MAP = JSON.stringify({ octocat: 'U000000' });
    const override = { octocat: 'U999999' };
    expect(loadReviewerMap(override)).toEqual(override);
  });
});

describe('resolveReviewer', () => {
  const map = { octocat: 'U012AB3CD', torvalds: 'U098ZY7WX' };

  it('returns Slack mention when username is in the map', () => {
    expect(resolveReviewer('octocat', map)).toBe('<@U012AB3CD>');
  });

  it('falls back to @githubUsername when not in the map', () => {
    expect(resolveReviewer('unknown-dev', map)).toBe('@unknown-dev');
  });

  it('handles empty map gracefully', () => {
    expect(resolveReviewer('octocat', {})).toBe('@octocat');
  });
});

describe('resolveReviewers', () => {
  const overrideMap = { octocat: 'U012AB3CD', torvalds: 'U098ZY7WX' };

  it('resolves multiple reviewers to Slack mentions', () => {
    const reviewers = [{ login: 'octocat' }, { login: 'torvalds' }];
    expect(resolveReviewers(reviewers, overrideMap)).toEqual([
      '<@U012AB3CD>',
      '<@U098ZY7WX>',
    ]);
  });

  it('falls back for unknown reviewers in a mixed list', () => {
    const reviewers = [{ login: 'octocat' }, { login: 'mystery-dev' }];
    expect(resolveReviewers(reviewers, overrideMap)).toEqual([
      '<@U012AB3CD>',
      '@mystery-dev',
    ]);
  });

  it('returns empty array for empty reviewers list', () => {
    expect(resolveReviewers([], overrideMap)).toEqual([]);
  });
});
