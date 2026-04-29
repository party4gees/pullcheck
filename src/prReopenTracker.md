# prReopenTracker

Detects pull requests that have been closed and reopened one or more times. Repeatedly reopened PRs can signal ongoing disagreements, blocked work, or unstable implementations — worth flagging for extra attention.

## Functions

### `countReopens(events)`
Counts how many times a PR has been reopened based on its timeline events.

- **events** — array of `{ event, created_at }` objects from the GitHub timeline API
- Returns a `number`

### `lastReopenedAt(events)`
Returns the ISO timestamp of the most recent reopen, or `null` if the PR has never been reopened.

### `annotateWithReopenInfo(prs)`
Annotates each PR object with:
- `reopenCount` — total number of reopens
- `lastReopenedAt` — timestamp of the most recent reopen, or `null`

Expects each PR to have a `timelineEvents` array.

### `filterReopenedPRs(prs, minReopens = 1)`
Returns only PRs whose `reopenCount` meets or exceeds `minReopens`. Expects PRs to already be annotated via `annotateWithReopenInfo`.

## Usage

```js
const { annotateWithReopenInfo, filterReopenedPRs } = require('./prReopenTracker');

const annotated = annotateWithReopenInfo(prs);
const troubled = filterReopenedPRs(annotated, 2);
// troubled = PRs reopened 2+ times
```

## Notes

- Timeline events must include `{ event: 'reopened', created_at: '...' }` entries.
- Pairs well with `prBlockerDetector` and `prCycleTimeTracker` to surface truly problematic PRs.
