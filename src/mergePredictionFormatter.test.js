const {
  formatPredictionLine,
  buildMergePredictionMessage,
} = require('./mergePredictionFormatter');

const makePR = (overrides = {}) => ({
  id: 1,
  title: 'Fix bug',
  url: 'https://github.com/org/repo/pull/1',
  mergeScore: 80,
  mergeTier: 'high',
  ...overrides,
});

describe('formatPredictionLine', () => {
  it('includes the PR title and url', () => {
    const line = formatPredictionLine(makePR());
    expect(line).toContain('Fix bug');
    expect(line).toContain('https://github.com/org/repo/pull/1');
  });

  it('shows the correct score', () => {
    const line = formatPredictionLine(makePR({ mergeScore: 55, mergeTier: 'medium' }));
    expect(line).toContain('55/100');
  });

  it('uses green emoji for high tier', () => {
    expect(formatPredictionLine(makePR({ mergeTier: 'high' }))).toContain('🟢');
  });

  it('uses yellow emoji for medium tier', () => {
    expect(formatPredictionLine(makePR({ mergeTier: 'medium' }))).toContain('🟡');
  });

  it('uses red emoji for low tier', () => {
    expect(formatPredictionLine(makePR({ mergeTier: 'low' }))).toContain('🔴');
  });
});

describe('buildMergePredictionMessage', () => {
  it('returns a fallback message for empty input', () => {
    const msg = buildMergePredictionMessage([]);
    expect(msg.text).toMatch(/no prs/i);
  });

  it('returns blocks array for non-empty input', () => {
    const msg = buildMergePredictionMessage([makePR()]);
    expect(Array.isArray(msg.blocks)).toBe(true);
    expect(msg.blocks.length).toBeGreaterThan(0);
  });

  it('sorts PRs by score descending', () => {
    const prs = [
      makePR({ id: 1, title: 'Low PR', mergeScore: 20, mergeTier: 'low' }),
      makePR({ id: 2, title: 'High PR', mergeScore: 90, mergeTier: 'high' }),
    ];
    const msg = buildMergePredictionMessage(prs);
    const section = msg.blocks.find((b) => b.type === 'section');
    const text = section.text.text;
    expect(text.indexOf('High PR')).toBeLessThan(text.indexOf('Low PR'));
  });

  it('includes PR count in context block', () => {
    const msg = buildMergePredictionMessage([makePR(), makePR({ id: 2 })]);
    const ctx = msg.blocks.find((b) => b.type === 'context');
    expect(ctx.elements[0].text).toContain('2 PR(s)');
  });
});
