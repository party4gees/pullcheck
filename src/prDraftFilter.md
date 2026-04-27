# prDraftFilter + draftNotifier

Utilities for detecting, filtering, and notifying about **draft pull requests** that have gone stale.

## Modules

### `prDraftFilter.js`

Core helpers for working with draft PR status.

| Function | Description |
|---|---|
| `isDraft(pr)` | Returns `true` if `pr.draft === true` |
| `filterDrafts(prs)` | Removes draft PRs from a list |
| `isolateDrafts(prs)` | Returns only draft PRs |
| `annotateWithDraftStatus(prs)` | Adds `isDraft` boolean field to each PR |
| `draftSummary(prs)` | Returns `{ total, drafts, ready }` counts |

### `draftNotifier.js`

Builds Slack alert messages for draft PRs that have been open too long.

| Function | Description |
|---|---|
| `filterStaleDrafts(prs, thresholdDays?)` | Filters draft PRs older than threshold (default: 5 days) |
| `formatDraftLine(pr)` | Formats a single PR as a Slack bullet line |
| `buildDraftAlertMessage(prs, repoName)` | Builds a full Slack block message; returns `null` if no PRs |

## Usage

```js
const { filterStaleDrafts, buildDraftAlertMessage } = require('./draftNotifier');

const staleDrafts = filterStaleDrafts(allPRs, 7);
const message = buildDraftAlertMessage(staleDrafts, 'org/my-repo');
if (message) {
  await slackClient.post(message);
}
```

## Configuration

The default stale threshold is **5 days**. Pass a second argument to `filterStaleDrafts` to override:

```js
filterStaleDrafts(prs, 3); // flag drafts open 3+ days
```

## Notes

- Draft PRs are excluded from the main stale PR detector by default.
- Use `filterDrafts` before passing PRs to other pipeline stages to avoid double-alerting.
