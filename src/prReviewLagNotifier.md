# prReviewLagNotifier

Formats and sends Slack alerts for pull requests with high review lag — PRs that have been waiting for reviewer action for too long.

## Functions

### `formatReviewLagLine(pr)`
Returns a single formatted string for a PR with notable review lag, including age, lag tier, and reviewer info.

### `filterHighLagPRs(prs, minHours)`
Filters annotated PRs down to those whose `reviewLagHours` exceeds the given threshold (default: 24 hours).

### `buildReviewLagMessage(prs, options)`
Builds a full Slack block message summarizing all high-lag PRs. Groups by lag tier when there are multiple tiers present.

## Usage

```js
const { annotateWithReviewLag } = require('./prReviewLagTracker');
const { buildReviewLagMessage } = require('./reviewLagNotifier');

const annotated = annotateWithReviewLag(prs);
const message = buildReviewLagMessage(annotated, { minHours: 48 });
await postToSlack(message);
```

## Lag Tiers

| Tier | Hours |
|------|-------|
| `low` | < 24h |
| `medium` | 24–72h |
| `high` | > 72h |

## Notes
- PRs without an `updatedAt` timestamp are skipped.
- Draft PRs are excluded by default unless `includeDrafts: true` is passed.
