# prSizeClassifier

Classifies pull requests by size based on the number of changed lines and files, and provides helpers for filtering and annotation.

## Functions

### `classifySize(pr)`

Returns a size label for a PR.

| Size | Max lines (add+del) | Max files |
|------|--------------------|-----------|
| `xs` | 10 | 1 |
| `small` | 50 | 5 |
| `medium` | 250 | 10 |
| `large` | 1000 | 25 |
| `xl` | > 1000 or > 25 files | — |

Both thresholds must be satisfied for a PR to qualify for a smaller bucket. If either exceeds the threshold, it moves to the next tier.

```js
classifySize({ additions: 30, deletions: 10, changed_files: 4 }); // 'small'
```

### `sizeEmoji(size)`

Returns a colored circle emoji for the given size label.

```js
sizeEmoji('xl'); // '🔴'
```

### `annotateWithSize(prs)`

Returns a new array of PRs each augmented with `size` and `sizeEmoji` fields. Does not mutate the originals.

```js
const annotated = annotateWithSize(prs);
// annotated[0].size === 'medium'
// annotated[0].sizeEmoji === '🟡'
```

### `filterBySize(prs, size)`

Filters PRs to only those matching the specified size label.

```js
const bigOnes = filterBySize(prs, 'xl');
```

## Related

- `sizeNotifier.js` — builds Slack alerts for oversized PRs using this classifier.
