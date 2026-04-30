# prWipDetector

Detects Work-In-Progress (WIP) pull requests based on title conventions, labels, and GitHub's native draft status.

## Functions

### `isWipTitle(title)`
Returns `true` if the PR title starts with a known WIP prefix such as `wip:`, `[wip]`, or `do not merge`.

### `isWipLabel(labels)`
Returns `true` if any of the provided label strings match known WIP label names (case-insensitive).

### `isWip(pr)`
Combines draft status, title check, and label check. Returns `true` if any indicator is present.

### `annotateWithWip(prs)`
Returns a new array of PR objects each annotated with a `wip: boolean` field.

### `filterWip(prs)`
Returns only PRs that are **not** WIP — useful for focusing notifications on actionable PRs.

### `isolateWip(prs)`
Returns only PRs that **are** WIP — useful for building dedicated WIP digests.

---

## wipNotifier

Builds Slack messages for WIP PRs that have been open too long.

### `filterStaleWip(prs, staleDays = 3)`
Filters WIP PRs open for at least `staleDays` days.

### `buildWipAlertMessage(prs, { repo, staleDays })`
Builds a formatted Slack message listing stale WIP PRs. Returns `null` if none qualify.

## Example output

```
:construction: *2 stale WIP PRs in *org/repo** (open ≥3d):
• *#12 wip: refactor auth* [wip] — open for *5d*
• *#17 [WIP] update deps* [wip] — open for *4d*
```
