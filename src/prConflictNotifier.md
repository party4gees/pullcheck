# prConflictNotifier

Builds Slack alert messages for pull requests that have merge conflicts or have fallen behind their base branch.

## Functions

### `formatConflictLine(pr)`

Formats a single PR into a Slack-friendly list entry, annotating it with relevant conflict tags.

**Tags applied:**
- ⚠️ `merge conflict` — PR has a merge conflict (`conflictStatus.hasConflict === true`)
- 🔄 `behind base` — PR is behind its base branch (`conflictStatus.isBehindBase === true`)

**Input:** PR object annotated by `prConflictDetector.annotateWithConflictStatus`

**Returns:** Formatted string line.

---

### `buildConflictAlertMessage(prs, repo?)`

Builds a full Slack block message listing all conflicted or stale PRs.

**Parameters:**
- `prs` — Array of annotated PR objects
- `repo` *(optional)* — Repository name shown in the alert header

**Returns:** Multi-line Slack message string, or `''` if no PRs provided.

---

## Usage

```js
const { annotateWithConflictStatus, filterConflicted, filterBehindBase } = require('./prConflictDetector');
const { buildConflictAlertMessage } = require('./prConflictNotifier');

const annotated = prs.map(annotateWithConflictStatus);
const needsAttention = [
  ...filterConflicted(annotated),
  ...filterBehindBase(annotated),
];

const message = buildConflictAlertMessage(needsAttention, 'org/repo');
await slackClient.post(message);
```

## Dependencies

- Works with output from `src/prConflictDetector.js`
- Output is consumed by the Slack notifier pipeline
