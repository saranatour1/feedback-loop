<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->

## Conventions

These apply to everyone working in this repo, human or agent.

### Tooling

- Use pnpm (`pnpm install`, `pnpm run <script>`). `pnpm-lock.yaml` is the source of truth.
- Dev server: `pnpm dev` runs Convex and Vite on port 3100. Check whether 3100 is already in use before starting it, and never run two.
- Before pushing, `pnpm run typecheck`, `pnpm run lint` and `pnpm run build` must pass.
- Never edit generated files: `convex/_generated/` and `src/routeTree.gen.ts`.

### Code style and structure

- Prettier owns formatting (no semicolons, single quotes, trailing commas). Run `pnpm run format`; don't hand-format.
- ESLint (`@tanstack/eslint-config` + `@convex-dev/eslint-plugin`) must pass with zero warnings.
- Where code lives:
  - `src/routes/`: TanStack Router file routes.
  - `src/components/ui/`: UI kit primitives. Don't put app logic here.
  - `src/components/`: app components built from the UI kit.
  - `src/hooks/`: React hooks.
  - `src/lib/`: plain helpers with no React or Convex dependencies.
  - `convex/`: backend functions, schema and config.
- File names are kebab-case (`sign-in-with-link.tsx`, `use-media-query.ts`). Components are PascalCase, hooks start with `use`.
- Import app code through the `~/` alias, not long relative paths.
- Type-only imports use a top-level `import type { X }`. Array types use `Array<T>` and `ReadonlyArray<T>`.
- No `any`. Use `Id<'table'>` and `Doc<'table'>` from `convex/_generated/dataModel` instead of `string` for IDs.
- Comments explain why, not what.

### Convex backend

- Read `convex/_generated/ai/guidelines.md` before writing Convex code. Where it disagrees with this list, it wins.
- Layout:
  - `convex/api/<name>.ts`: thin files that re-export a feature's functions. These are the only files that register endpoints (`api.api.<name>.*`).
  - `convex/features/<name>/`: `models.ts` (tables), `validators.ts`, `public.ts` and `internal.ts` (functions bundled into `publicApi` and `internalApi` objects, never exported one by one), `index.ts` (merges them).
  - `convex/lib/`: shared helpers, such as the function wrappers in `functions.ts`.
  - `convex/schema.ts`: builds the schema from each feature's `models.ts`.
- Every function declares `args` and `returns` validators.
- Only functions the client calls are public (`query`, `mutation`, `action`). Everything else is `internalQuery`, `internalMutation` or `internalAction`.
- Functions that need a signed-in user are built with `authedQuery` or `authedMutation` from `convex/lib/functions.ts` and read `ctx.userId`. Call `getAuthUserId(ctx)` directly only where signed-out callers are allowed. Never accept a user ID as an argument for authorization, and check ownership of every document a caller reads or writes by ID.
- Component functions (auth, Resend) are called from app functions, never directly from the client.
- Queries use `.withIndex()` and are bounded with `.take(n)` or pagination. No `.collect()` on tables that grow, and no `Date.now()` inside queries.
- Index names list their fields in order: `by_field1_and_field2`.
- Keep the schema minimal: three app tables or fewer by default. Justify anything beyond that in the PR.
- Declare env vars in `convex/convex.config.ts` under `env` and read them from `env` in `./_generated/server`, not `process.env`. Set values with `npx convex env set`; they never go in code or git.
- Actions that need Node built-ins go in their own file starting with `"use node";`.
- Dev deployments only need password and passkey sign-in. `RESEND_API_KEY` and the six OAuth vars are optional, so leave them unset. The sign-in page hides magic-link sign-in and any provider that isn't configured, based on `api.api.auth.signInMethods`. If Convex refuses to deploy because an auth component needs a value, set that provider's vars to `unset`, which also counts as not configured:

  ```bash
  for p in GITHUB GOOGLE DISCORD; do npx convex env set AUTH_${p}_CLIENT_ID unset; npx convex env set AUTH_${p}_CLIENT_SECRET unset; done
  ```

### UI

- Build from `src/components/ui/` first. Add new primitives from the `@coss` registry configured in `components.json` instead of writing them by hand.
- Style with Tailwind utilities and `cn()` from `~/lib/utils`. Design tokens live in `src/styles/app.css`.
- Icons come from `lucide-react`.
- Sans-serif font stacks end with `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`. Never fall back to the browser's default serif.
- Don't add `disabled` to buttons unless the logic requires it.
- Format dates with the native `Intl` API. Use Luxon only for real timezone math or complex parsing, and never hand-write date helpers.
- No emojis as bullets or decoration.

### Dependencies

- Ask before adding a package. Prefer native APIs and existing dependencies.
- Approved packages must be widely used and well maintained, and are pinned to an exact version (`pnpm add --save-exact`).
- Scripts are written in TypeScript or shell, not Python.

### Git and workflow

- Never push to `main`. One feature = one branch = one PR.
- Follow [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/) for commit messages, PR titles and branch names. The `conventional-git` skill (`.claude/skills/conventional-git/`) has the step-by-step version.
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`. Scopes are optional and name the area, such as `convex`, `ui`, `auth` or `deps`.
- Commit messages: `<type>(<scope>): <description>`, imperative, lowercase, no trailing period, under 72 characters (`feat(convex): add feedback list query`). Use the body to explain why. Mark breaking changes with `!` after the type or scope and a `BREAKING CHANGE:` footer.
- PR titles use the same format as a commit subject, since they become the squash-merge commit.
- PR descriptions have a `## Summary` (what and why), a `## Changes` list grouped by commit type, a `## Testing` list of what was run and its result, and a `## Breaking changes` section when the title has `!`.
- Branch names: `<type>/<short-kebab-description>`, using the same types (`feat/feedback-list`, `fix/magic-link-redirect`).
- Never commit secrets: no `.env` file of any name, deploy keys or OAuth secrets. App secrets live in the Convex deployment's env.
- Don't create git worktrees without asking.
