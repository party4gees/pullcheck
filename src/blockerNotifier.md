# blockerNotifier

Formats and builds Slack alert messages for pull requests that are currently blocked from merging.

## Functions

### `formatBlockerLine(pr)`

Formats a single blocked PR into a readable Slack message line.

**Parameters:**
- `pr` — PR object with `number`, `title`, `url`, `author`, and `blockers` array.

**Returns:** A formatted string summarizing the PR and its blockers.

**Example:**
```js
formatBlockerLine({
  number: 12,
  title: 'Add OAuth',
  url: 'https://github.com/org/repo/pull/12',
  author: 'bob',
  blockers: ['failing_checks', 'changes_requested'],
});
// => '🚫 <https://github.com/org/repo/pull/12|#12 Add OAuth> — blocked by: failing_checks, changes_requested'
```

---

### `buildBlockerAlertMessage(prs)`

Builds a full Slack message summarizing all blocked PRs.

**Parameters:**
- `prs` — Array of annotated PR objects (each with a `blockers` array).

**Returns:** A formatted multi-line string, or `null` if the list is empty.

**Example:**
```js
buildBlockerAlertMessage(blockedPRs);
// => '*🚫 3 blocked PR(s) need attention:*\n...'
```

---

## Blocker Types

| Blocker              | Meaning                              |
|----------------------|--------------------------------------|
| `failing_checks`     | One or more CI checks are failing    |
| `changes_requested`  | A reviewer has requested changes     |

---

## Usage

```js
const { annotateWithBlockers, filterBlockedPRs } = require('./prBlockerDetector');
const { buildBlockerAlertMessage } = require('./blockerNotifier');

const annotated = annotateWithBlockers(prs);
const blocked = filterBlockedPRs(annotated);
const message = buildBlockerAlertMessage(blocked);

if (message) await postToSlack(message);
```
