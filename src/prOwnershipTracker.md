# prOwnershipTracker & ownershipNotifier

Tracks which team member "owns" each open pull request and generates per-owner Slack digests.

## Modules

### `prOwnershipTracker.js`

Determines ownership using a priority chain:

1. **Assignee** (highest priority)
2. **Requested reviewer**
3. **PR author** (fallback)

#### Exports

| Function | Description |
|---|---|
| `resolveOwner(pr)` | Returns the GitHub login of the resolved owner |
| `annotateWithOwner(prs)` | Adds `owner` field to each PR (non-mutating) |
| `groupByOwner(prs)` | Returns `{ [login]: pr[] }` map |
| `filterByOwner(prs, login)` | Returns PRs matching a specific owner |

### `ownershipNotifier.js`

Builds Slack messages for each owner listing their open PRs.

#### Exports

| Function | Description |
|---|---|
| `formatOwnershipLine(pr)` | Single PR line with number, title, and age |
| `buildOwnerDigest(handle, prs)` | Full Slack block for one owner |
| `buildOwnershipMessages(prs, reviewerMap)` | Returns `{ handle, message }[]` for all owners |

## Usage

```js
const { annotateWithOwner } = require('./prOwnershipTracker');
const { buildOwnershipMessages } = require('./ownershipNotifier');

const annotated = annotateWithOwner(openPRs);
const messages = buildOwnershipMessages(annotated, reviewerMap);

for (const { handle, message } of messages) {
  await slack.send(message);
}
```

## Notes

- `reviewerMap` maps GitHub logins to Slack usernames (without `@`).
- PRs should be annotated with `staleDays` for age to appear in digests.
- Works alongside `reviewerResolver.js` for consistent handle resolution.
