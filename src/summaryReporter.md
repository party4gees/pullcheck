# summaryReporter

Posts a **run-level summary** to Slack after pullcheck finishes scanning a repository. Unlike the per-PR messages sent by `slackNotifier`, this module sends a single digest message that lists every stale PR found in one shot.

## Exports

### `buildSummaryMessage(stalePRs, repoName)`

Builds a Slack Block Kit payload summarising the stale PRs.

| Param | Type | Description |
|-------|------|-------------|
| `stalePRs` | `Array` | PR objects enriched with a `daysStale` field (see `stalePRDetector`) |
| `repoName` | `string` | Full repository name, e.g. `owner/repo` |

Returns a plain object with `text` (fallback string) and `blocks` (Block Kit array).

### `postSummary(token, channel, stalePRs, repoName)`

Asynchronously posts the summary message to Slack.

| Param | Type | Description |
|-------|------|-------------|
| `token` | `string` | Slack bot token (`xoxb-…`) |
| `channel` | `string` | Slack channel ID or name |
| `stalePRs` | `Array` | Same as above |
| `repoName` | `string` | Same as above |

## Usage

```js
const { postSummary } = require('./summaryReporter');

await postSummary(
  process.env.SLACK_TOKEN,
  '#eng-prs',
  stalePRs,          // array from stalePRDetector
  'acme/backend'
);
```

## Config

The summary channel is read from `pullcheck.yml` under the `summary_channel` key. If omitted, no summary is posted.

```yaml
summary_channel: "#pr-digest"
```
