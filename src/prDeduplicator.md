# prDeduplicator

Prevents repeated Slack notifications for the same PR event within a configurable cooldown window.

## Why

Without deduplication, every run of the GitHub Action could re-alert reviewers about the same stale PR, causing noise. `prDeduplicator` tracks what was already sent and skips redundant messages.

## API

### `makeDedupeKey(pr, notificationType) → string`

Builds a stable string key for a given PR + notification type combination.

```js
makeDedupeKey({ number: 42, repo: 'org/repo' }, 'stale');
// → 'org/repo#42:stale'
```

### `isDuplicate(sentLog, key, cooldownHours, now?) → boolean`

Returns `true` if the notification was already sent within `cooldownHours`.

### `recordSent(sentLog, key, now?) → Object`

Returns a new log object with the given key stamped at `now`. Does **not** mutate the input.

### `filterDuplicates(notifications, sentLog, cooldownHours, now?) → Array`

Filters an array of `{ pr, type }` objects, keeping only those not yet covered by the cooldown.

```js
const due = filterDuplicates(allNotifications, sentLog, 24);
```

### `pruneSentLog(sentLog, retentionHours, now?) → Object`

Removes entries older than `retentionHours` to keep the log from growing unbounded.

## Integration

```js
let sentLog = loadSentLog(); // from file / cache
const due = filterDuplicates(notifications, sentLog, config.cooldownHours);

for (const { pr, type } of due) {
  await sendSlackNotification(pr, type);
  sentLog = recordSent(sentLog, makeDedupeKey(pr, type));
}

sentLog = pruneSentLog(sentLog, 72);
saveSentLog(sentLog);
```

## Notes

- `sentLog` is a plain object; persistence (file, Redis, etc.) is left to the caller.
- All functions are pure and side-effect free.
