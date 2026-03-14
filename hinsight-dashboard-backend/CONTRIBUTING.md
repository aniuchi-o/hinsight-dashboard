
### `CONTRIBUTING.md`
```md
# Contributing

## Branching
- Create branches like: `feature/<ticket>-short-name`
- PRs required to merge into `main`

## Quality gate
Before pushing:
```bash
ruff check .
ruff format .
pytest
