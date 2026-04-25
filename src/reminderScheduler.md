# reminderScheduler

Determines **which stale pull requests are due for a reminder** on any given run,
based on escalation intervals configured in `pullcheck.yml`.

## Why this module exists

Not every stale PR should ping reviewers every time the action runs.
Instead, reminders are sent only on specific "day milestones" (e.g. day 1, day 3, day 7).
This avoids notification fatigue while still escalating genuinely forgotten PRs.

## Exports

### `shouldSendReminder(daysStale, intervals) → boolean`

Returns `true` if `daysStale` is listed in the `intervals` array.

```js
shouldSendReminder(3, [1, 3, 7]); // true
shouldSendReminder(4, [1, 3, 7]); // false
```

### `filterDueReminders(stalePRs, intervals) → PR[]`

Filters an array of stale PR objects, keeping only those whose `daysStale`
value falls on a configured reminder interval.

```js
const due = filterDueReminders(stalePRs, [1, 3, 7]);
```

Each PR object must have at minimum:
```json
{ "number": 42, "daysStale": 3 }
```

### `getReminderLabel(daysStale, intervals) → string`

Returns a human-readable label useful for logging and Slack messages.

```js
getReminderLabel(7, [1, 3, 7, 14]);
// "Day 7 reminder (escalation 3 of 4)"
```

## Configuration

Intervals are read from `pullcheck.yml` via `configLoader`:

```yaml
reminder_intervals_days: [1, 3, 7, 14]
```

If the key is omitted, no reminders are sent.
