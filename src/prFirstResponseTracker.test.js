const {
  hoursBetween,
  firstResponseAt,
  computeFirstResponseHours,
  responseTier,
  annotateWithFirstResponse,
  filterUnresponded,
} = require('./prFirstResponseTracker');

function hoursAgo(h) {
  return new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
}

function makePR(overrides = {}) {
  return {
    number: 1,
    title: 'Test PR',
    createdAt: hoursAgo(48),
    reviewComments: [],
    reviews: [],
    ...overrides,
  };
}

describe('hoursBetween', () => {
  test('calculates hours correctly', () => {
    const start = '2024-01-01T00:00:00Z';
    const end = '2024-01-01T06:00:00Z';
    expect(hoursBetween(start, end)).toBeCloseTo(6);
  });
});

describe('firstResponseAt', () => {
  test('returns null when no reviews or comments', () => {
    const pr = makePR();
    expect(firstResponseAt(pr)).toBeNull();
  });

  test('returns earliest review comment timestamp', () => {
    const pr = makePR({
      reviewComments: [{ createdAt: hoursAgo(10) }, { createdAt: hoursAgo(5) }],
    });
    const result = firstResponseAt(pr);
    expect(result).toBeTruthy();
  });

  test('returns earliest across reviews and comments', () => {
    const early = hoursAgo(20);
    const late = hoursAgo(5);
    const pr = makePR({
      reviewComments: [{ createdAt: late }],
      reviews: [{ submittedAt: early }],
    });
    expect(firstResponseAt(pr)).toBe(early);
  });
});

describe('computeFirstResponseHours', () => {
  test('returns null when no response', () => {
    expect(computeFirstResponseHours(makePR())).toBeNull();
  });

  test('returns approximate hours to first response', () => {
    const pr = makePR({
      createdAt: hoursAgo(10),
      reviews: [{ submittedAt: hoursAgo(6) }],
    });
    const hours = computeFirstResponseHours(pr);
    expect(hours).toBeCloseTo(4, 0);
  });
});

describe('responseTier', () => {
  test('null => none', () => expect(responseTier(null)).toBe('none'));
  test('2h => fast', () => expect(responseTier(2)).toBe('fast'));
  test('12h => normal', () => expect(responseTier(12)).toBe('normal'));
  test('48h => slow', () => expect(responseTier(48)).toBe('slow'));
  test('100h => critical', () => expect(responseTier(100)).toBe('critical'));
});

describe('annotateWithFirstResponse', () => {
  test('annotates PRs with firstResponseHours and responseTier', () => {
    const pr = makePR({ reviews: [{ submittedAt: hoursAgo(2) }] });
    const [annotated] = annotateWithFirstResponse([pr]);
    expect(annotated).toHaveProperty('firstResponseHours');
    expect(annotated).toHaveProperty('responseTier');
    expect(annotated.responseTier).toBe('fast');
  });

  test('marks unresponded PR with tier none', () => {
    const [annotated] = annotateWithFirstResponse([makePR()]);
    expect(annotated.responseTier).toBe('none');
    expect(annotated.firstResponseHours).toBeNull();
  });
});

describe('filterUnresponded', () => {
  test('returns only PRs with no response', () => {
    const responded = makePR({ reviews: [{ submittedAt: hoursAgo(5) }] });
    const silent = makePR({ number: 2 });
    const result = filterUnresponded([responded, silent]);
    expect(result).toHaveLength(1);
    expect(result[0].number).toBe(2);
  });
});
