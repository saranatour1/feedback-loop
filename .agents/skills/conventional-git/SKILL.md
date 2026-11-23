---
name: conventional-git
description: "Name branches, write commit messages, and write PR titles and descriptions for this repo using Conventional Commits 1.0.0. Use whenever creating a branch, committing, opening or updating a pull request, or writing a PR title or description, even if the user doesn't mention conventions."
---

# Conventional git for feedback-loop

Every branch name, commit message, PR title and PR description in this repo follows [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/). This skill is the how-to for the rules in the "Git and workflow" section of `AGENTS.md` / `CLAUDE.md`. If the two ever disagree, `AGENTS.md` wins.

## 1. Pick the type

Read the diff (`git diff master...HEAD --stat`, then the files) and choose the type from what the change does, not from which files moved:

| Type | Use for |
| --- | --- |
| `feat` | New behaviour a user or a caller of the API can see |
| `fix` | A bug fix |
| `docs` | Documentation only (`*.md`, comments) |
| `style` | Formatting with no behaviour change |
| `refactor` | Restructuring with no behaviour change |
| `perf` | Faster or cheaper, same behaviour |
| `test` | Tests only |
| `build` | Dependencies, `package.json`, lockfiles, build config |
| `ci` | CI configuration |
| `chore` | Anything else that doesn't touch `src/` or `convex/` behaviour |
| `revert` | Reverting an earlier commit |

Scope is optional. Use it to name the area: `convex`, `ui`, `auth`, `deps`, or a feature name such as `users`.

A change is **breaking** when existing callers must change: renamed or moved Convex functions (`api.*` paths), removed tables or fields, changed function args or return shapes, removed routes. Mark it with `!` after the type or scope.

## 2. Branch name

```
<type>/<short-kebab-description>
```

Examples: `feat/feedback-list`, `fix/magic-link-redirect`, `build/add-convex-helpers`. Lowercase, 2 to 5 words, no scope, no ticket numbers unless the user gives one. One feature per branch, and never commit to `master`.

## 3. Commit messages

```
<type>(<scope>)!: <description>

<body: why, not what>

BREAKING CHANGE: <what callers must change>
```

- The subject is imperative, lowercase and has no trailing period, and stays under 72 characters: `feat(convex): add feedback list query`.
- Leave out `(<scope>)` when there isn't a clear area, and `!` and the footer when nothing breaks.
- The body is optional for small changes. When present, it explains why.
- Never include Claude session links: no `Claude-Session:` trailer and no `claude.ai/code/session_...` URL. A `Co-Authored-By:` trailer is fine.

## 4. PR title

The PR title is the squash-merge commit, so it uses the same format as a commit subject. When the PR has several commits, take the most significant type (`feat` > `fix` > `refactor` > the rest) and mark `!` if any commit breaks.

## 5. PR description

Use exactly these sections, in this order. Leave out "Breaking changes" when the title has no `!`.

```markdown
## Summary

One or two short paragraphs: what this PR does and why.

## Changes

### feat
- ...

### fix
- ...

(one heading per type that appears, in the type table's order)

## Testing

- `pnpm run typecheck`: passes / fails (say why)
- `pnpm run lint`: ...
- `pnpm run build`: ...
- Anything checked by hand, and anything not run, with the reason.

## Breaking changes

BREAKING CHANGE: what callers must change, and any step needed before or after merging.
```

Report test results as they are. If a check fails or wasn't run, say so with the reason. Don't leave it out.

Never put Claude session links (`claude.ai/code/session_...`) in a PR title or description.

## 6. Check before pushing

Validate the branch name and every commit subject on the branch with shell:

```bash
types='feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert'
git branch --show-current | grep -Eq "^($types)/[a-z0-9]+(-[a-z0-9]+)*$" && echo "branch ok" || echo "branch name does not follow <type>/<kebab-description>"
git log --format=%s master..HEAD | grep -Ev "^($types)(\([a-z0-9-]+\))?!?: [a-z].{0,70}$" || echo "all commit subjects ok"
```

Any subject the second command prints needs rewording. Only reword commits that haven't been pushed, or on a branch nobody else has pulled. Otherwise, leave them and rely on the conventional PR title for the squash merge.
