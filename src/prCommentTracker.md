# prCommentTracker

Tracks comment activity on pull requests to surface PRs that have gone quiet — no reviewer responses, no author follow-ups.

## Why

A PR can be technically "open" and not stale by age, but still stuck because nobody has replied in days. This module adds a second signal: **comment inactivity**.

## Functions

### `daysSinceLastComment(lastCommentAt, now?)`

Returns the number of days since the given date. Returns `Infinity` if no date is provided, treating the PR as having never received a comment.

```js
daysSinceLastComment('2024-06-12T12:00:00Z', new Date('2024-06-15T12:00:00Z'));
// => 3
```

### `isQuiet(pr, quietThresholdDays?, now?)`

Returns `true` if the PR's last comment was more than `quietThresholdDays` ago (default: 3).

```js
isQuiet({ lastCommentAt: '2024-06-10T00:00:00Z' }, 3);
// => true (5 days ago)
```

### `filterQuietPRs(prs, quietThresholdDays?, now?)`

Filters an array of PRs, returning only those that have gone quiet.

```js
const quiet = filterQuietPRs(allPRs, 3);
```

### `annotateWithQuietDays(prs, now?)`

Returns a new array of PR objects, each annotated with a `quietDays` field. Does not mutate originals.

```js
const annotated = annotateWithQuietDays(prs);
// annotated[0].quietDays => 4
```

## Expected PR shape

```js
{
  id: 42,
  title: 'Fix login bug',
  lastCommentAt: '2024-06-12T08:30:00Z', // ISO string or null
}
```

## Integration

Use alongside `stalePRDetector` and `reminderScheduler` to build a complete picture of which PRs need attention.
