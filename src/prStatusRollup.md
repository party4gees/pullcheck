# prStatusRollup

Aggregates per-PR CI checks, approval counts, and merge conflict state into a single traffic-light rollup suitable for Slack notifications.

## Functions

### `rollupStatus(pr) → 'green' | 'yellow' | 'red'`

Derives an overall status for a PR:

| Condition | Status |
|---|---|
| Any check `failure` / `error` OR `mergeable === false` | `red` |
| Any check `pending` OR zero approvals | `yellow` |
| All checks pass and at least one approval | `green` |

### `statusEmoji(status) → string`

Maps a status string to a Slack-friendly emoji: `✅` / `⏳` / `🚨`.

### `annotateWithRollup(prs) → prs[]`

Returns a new array of PR objects, each extended with `rollupStatus` and `rollupEmoji`. Does **not** mutate the originals.

### `formatRollupLine(pr) → string`

Formats a single annotated PR as a Slack mrkdwn line, e.g.:

```
✅ *<https://github.com/.../pull/42|Fix login bug>* — 2 approval(s), 3 check(s)
```

Appends `⚠️ conflict` when `mergeable` is `false`.

### `buildRollupMessage(prs) → string`

Builds the complete Slack message for a list of PRs, including a header with the total count.

## PR Object Shape

```js
{
  title: string,
  url: string,
  approvals: number,       // count of approved reviews
  mergeable: boolean,      // false = has conflicts
  statusChecks: [          // array of CI check results
    { state: 'success' | 'failure' | 'error' | 'pending' }
  ]
}
```
