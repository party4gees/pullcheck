const { buildSummaryMessage } = require('./summaryReporter');

describe('buildSummaryMessage', () => {
  const repoName = 'acme/my-repo';

  describe('when there are no stale PRs', () => {
    it('returns a clean all-clear message', () => {
      const result = buildSummaryMessage([], repoName);
      expect(result.text).toContain('No stale PRs found');
      expect(result.text).toContain(repoName);
    });

    it('includes a single section block', () => {
      const result = buildSummaryMessage([], repoName);
      expect(result.blocks).toHaveLength(1);
      expect(result.blocks[0].type).toBe('section');
    });

    it('handles null input gracefully', () => {
      const result = buildSummaryMessage(null, repoName);
      expect(result.text).toContain('No stale PRs found');
    });
  });

  describe('when there are stale PRs', () => {
    const stalePRs = [
      { number: 42, title: 'Fix login bug', html_url: 'https://github.com/acme/my-repo/pull/42', daysStale: 7 },
      { number: 99, title: 'Update deps', html_url: 'https://github.com/acme/my-repo/pull/99', daysStale: 14 },
    ];

    it('mentions the count in the text fallback', () => {
      const result = buildSummaryMessage(stalePRs, repoName);
      expect(result.text).toContain('2 stale PR(s)');
      expect(result.text).toContain(repoName);
    });

    it('returns three blocks: header, section, context', () => {
      const result = buildSummaryMessage(stalePRs, repoName);
      expect(result.blocks).toHaveLength(3);
      expect(result.blocks[0].type).toBe('header');
      expect(result.blocks[1].type).toBe('section');
      expect(result.blocks[2].type).toBe('context');
    });

    it('includes PR numbers and titles in the section body', () => {
      const result = buildSummaryMessage(stalePRs, repoName);
      const sectionText = result.blocks[1].text.text;
      expect(sectionText).toContain('#42');
      expect(sectionText).toContain('Fix login bug');
      expect(sectionText).toContain('#99');
      expect(sectionText).toContain('14d');
    });

    it('includes the repo name in the header', () => {
      const result = buildSummaryMessage(stalePRs, repoName);
      expect(result.blocks[0].text.text).toContain(repoName);
    });

    it('includes a timestamp in the context block', () => {
      const result = buildSummaryMessage(stalePRs, repoName);
      const contextText = result.blocks[2].elements[0].text;
      expect(contextText).toContain('pullcheck');
    });
  });
});
