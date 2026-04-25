# prSnoozeManager

Manages per-PR snooze state so that already-acknowledged pull requests do not
trigger repeated Slack notifications until the snooze window expires.

## Functions

### `createSnooze(prId, days?, now?)`

Builds a snooze entry for a given PR.

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `prId` | `string` | — | Unique PR identifier, e.g. `"owner/repo#42"` |
| `days` | `number` | `2` | How many days to suppress notifications |
| `now` | `Date` | `new Date()` | Reference timestamp (useful for testing) |

Returns `{ prId, expiresAt }` where `expiresAt` is an ISO 8601 string.

---

### `isSnoozed(snoozeEntry, now?)`

Returns `true` if the snooze entry is still active (expiry is in the future).
Safe to call with `null` or `undefined`.

---

### `filterSnoozed(prs, snoozeMap, now?)`

Filters an array of PR objects, removing any whose `id` appears in `snoozeMap`
with an active (non-expired) snooze.

```js
const visible = filterSnoozed(stalePRs, snoozeMap);
// only PRs that are not currently snoozed
```

---

### `purgeExpiredSnoozes(snoozeMap, now?)`

Returns a **new** snooze map with expired entries removed. Call this
periodically (e.g. at the start of each run) to keep the persisted state lean.

```js
const cleaned = purgeExpiredSnoozes(loadedSnoozeMap);
await saveSnoozeMap(cleaned);
```

---

## Integration

The snooze map can be persisted to a JSON file, a GitHub Actions cache, or any
key-value store. `pullcheck` reads and writes it at the beginning and end of
each scheduled run:

```
load snoozeMap → purgeExpiredSnoozes → filterSnoozed(stalePRs) → notify → save snoozeMap
```
