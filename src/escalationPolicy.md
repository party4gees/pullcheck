# Escalation Policy

The escalation feature automatically detects stale PRs that have exceeded a configurable time threshold and notifies higher-tier reviewers (e.g. team leads) via Slack.

## How It Works

1. **Threshold check** — `shouldEscalate(staleDays, config)` compares the number of days a PR has been stale against `config.escalationDays` (default: `5`).
2. **Target resolution** — `resolveEscalationTarget(reviewer, escalationMap)` looks up the escalation contact for a given reviewer in the `escalationMap`.
3. **Context building** — `buildEscalationContext(pr, staleDays, config, escalationMap)` assembles a full escalation context object used downstream by the handler.

## Configuration (`pullcheck.yml`)

```yaml
escalationDays: 5           # Days stale before escalation triggers
escalationLabel: needs-escalation  # Label applied to escalated PRs
```

## Escalation Map

Define a JSON or YAML map of GitHub logins to escalation contacts:

```json
{
  "alice": "bob",
  "charlie": "diana"
}
```

This can be loaded from a separate config file and passed into `processEscalations`.

## Slack Message Format

```
:rotating_light: *Escalation Alert* — PR #42: _Fix critical bug_
This PR has been stale for *7 days* and needs attention.
Pinging escalation contacts: @bob, @diana
```

## Modules

| File | Role |
|---|---|
| `escalationPolicy.js` | Pure logic: thresholds, target resolution, context building |
| `escalationHandler.js` | Orchestration: processes PRs, builds Slack messages, collects labels |
