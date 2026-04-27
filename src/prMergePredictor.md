# prMergePredictor

Predicts the likelihood that a pull request will be merged soon, based on weighted activity signals. Pairs with `mergePredictionFormatter` to produce Slack-ready output.

## Signals & Weights

| Signal | Weight |
|---|---|
| 2+ approvals | 30 |
| CI passing | 25 |
| PR age ≤ 3 days | 20 |
| Recent comment (≤ 1 day) | 15 |
| Reviewer(s) assigned | 10 |

Scores are capped at **100**.

## Tiers

| Score | Tier |
|---|---|
| 75 – 100 | `high` 🟢 |
| 45 – 74 | `medium` 🟡 |
| 0 – 44 | `low` 🔴 |

## API

### `predictMergeLikelihood(pr, opts?)`

Returns a numeric score (0–100).

```js
const score = predictMergeLikelihood(
  { approvals: 2, reviewers: ['alice'], ageDays: 2 },
  { ciPassing: true, daysSinceLastComment: 0 }
);
// => 100
```

### `mergeTier(score)`

Maps a score to `'high'`, `'medium'`, or `'low'`.

### `annotatePRsWithPrediction(prs, optsResolver?)`

Returns a new array of PRs each extended with `mergeScore` and `mergeTier`.

```js
const annotated = annotatePRsWithPrediction(prs, (pr) => ({
  ciPassing: pr.ciStatus === 'success',
  daysSinceLastComment: pr.commentAge,
}));
```

## Usage with Slack

```js
const { annotatePRsWithPrediction } = require('./prMergePredictor');
const { buildMergePredictionMessage } = require('./mergePredictionFormatter');

const annotated = annotatePRsWithPrediction(openPRs, resolveOpts);
const message = buildMergePredictionMessage(annotated);
await slackClient.post(message);
```
