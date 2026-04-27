# prActivityScorer

Scores pull requests by their recent activity level, helping prioritise which PRs need attention and which are still being actively worked on.

## Overview

Each PR receives a numeric **activity score**. A higher score indicates a more active PR; a lower score suggests the PR has gone quiet and may need a nudge.

## Scoring Factors

| Factor | Default Weight | Notes |
|---|---|---|
| Recent comment (< 2 days) | +10 | Uses `daysSinceLastComment` |
| Review submitted | +8 per review | |
| Commit pushed | +6 per commit | Capped at 5 commits |
| Label applied | +3 per label | |
| Age penalty | −0.5 per day | Based on `created_at` |

Scores are floored at `0`.

## API

### `scorePR(pr, options?)`

Returns a single numeric score for the given PR object.

```js
const { scorePR } = require('./prActivityScorer');
const score = scorePR(pr);
```

Pass `options` to override any weight:

```js
scorePR(pr, { reviewSubmitted: 20 });
```

### `rankPRsByActivity(prs, options?)`

Returns `[{ pr, score }]` sorted by score descending.

```js
const ranked = rankPRsByActivity(openPRs);
console.log(ranked[0].pr.title); // most active PR
```

### `filterInactivePRs(prs, threshold?)`

Returns only PRs whose score falls below `threshold` (default `5`).

```js
const dormant = filterInactivePRs(openPRs, 10);
```

## Integration

This module pairs naturally with `prCommentTracker`, `stalePRDetector`, and `prGrouper` to build a full staleness pipeline.
