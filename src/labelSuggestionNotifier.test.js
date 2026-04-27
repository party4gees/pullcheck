const {
  getMissingLabels,
  formatSuggestionLine,
  buildLabelSuggestionMessage,
} = require('./labelSuggestionNotifier');

function makePR(overrides = {}) {
  return {
    title: 'Fix login bug',
    html_url: 'https://github.com/org/repo/pull/42',
    labels: [],
    suggestedLabels: [],
    ...overrides,
  };
}

describe('getMissingLabels', () => {
  it('returns all suggested labels when none are applied', () => {
    const pr = makePR({ suggestedLabels: ['type/fix', 'size/small'] });
    expect(getMissingLabels(pr)).toEqual(['type/fix', 'size/small']);
  });

  it('excludes labels already applied as objects', () => {
    const pr = makePR({
      suggestedLabels: ['type/fix', 'size/small'],
      labels: [{ name: 'type/fix' }],
    });
    expect(getMissingLabels(pr)).toEqual(['size/small']);
  });

  it('excludes labels already applied as strings', () => {
    const pr = makePR({
      suggestedLabels: ['type/fix'],
      labels: ['type/fix'],
    });
    expect(getMissingLabels(pr)).toEqual([]);
  });

  it('returns empty array when no suggestions', () => {
    const pr = makePR();
    expect(getMissingLabels(pr)).toEqual([]);
  });
});

describe('formatSuggestionLine', () => {
  it('formats a line with missing labels', () => {
    const pr = makePR({ suggestedLabels: ['type/fix', 'size/small'] });
    const line = formatSuggestionLine(pr);
    expect(line).toContain('Fix login bug');
    expect(line).toContain('`type/fix`');
    expect(line).toContain('`size/small`');
  });

  it('returns null when no missing labels', () => {
    const pr = makePR({
      suggestedLabels: ['type/fix'],
      labels: [{ name: 'type/fix' }],
    });
    expect(formatSuggestionLine(pr)).toBeNull();
  });
});

describe('buildLabelSuggestionMessage', () => {
  it('returns null when all PRs have their labels applied', () => {
    const pr = makePR({
      suggestedLabels: ['type/fix'],
      labels: ['type/fix'],
    });
    expect(buildLabelSuggestionMessage([pr])).toBeNull();
  });

  it('includes header and PR lines', () => {
    const pr = makePR({ suggestedLabels: ['type/fix'] });
    const msg = buildLabelSuggestionMessage([pr]);
    expect(msg).toContain(':label:');
    expect(msg).toContain('Label Suggestions');
    expect(msg).toContain('Fix login bug');
  });

  it('includes repo name in header when provided', () => {
    const pr = makePR({ suggestedLabels: ['docs'] });
    const msg = buildLabelSuggestionMessage([pr], 'org/repo');
    expect(msg).toContain('org/repo');
  });

  it('handles empty PR list', () => {
    expect(buildLabelSuggestionMessage([])).toBeNull();
  });
});
