# prLabelSuggester

Suggests GitHub labels for pull requests based on file paths, PR size, and title keywords.

## Functions

### `suggestLabels(pr)`
Returns an array of suggested label strings based on PR metadata.

**Logic:**
- Checks `pr.title` for keywords like `fix`, `feat`, `chore`, `docs`, `refactor`
- Checks `pr.changedFiles` paths for patterns like `test/`, `.md`, `config/`
- Checks `pr.additions + pr.deletions` for size-based labels (`size/small`, `size/large`, etc.)

**Returns:** `string[]`

---

### `annotateWithSuggestedLabels(prs)`
Maps over an array of PRs and attaches `suggestedLabels` to each.

**Returns:** array of PRs with `suggestedLabels: string[]`

---

### `filterWithSuggestions(prs)`
Filters to only PRs that have at least one suggested label.

**Returns:** filtered PR array

## Example

```js
const { annotateWithSuggestedLabels } = require('./prLabelSuggester');

const annotated = annotateWithSuggestedLabels(prs);
// annotated[0].suggestedLabels => ['type/fix', 'size/small']
```

## Notes

- Suggestions are additive — a PR may receive multiple labels
- Does not apply labels directly; use GitHub API separately
- Pairs well with `labelManager.js` for diffing against existing labels
