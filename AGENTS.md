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
- Every function declares `args` and `returns` validators.
- Only functions the client calls are public (`query`, `mutation`, `action`). Everything else is `internalQuery`, `internalMutation` or `internalAction`.
- Get the caller from `getAuthUserId(ctx)`. Never accept a user ID as an argument for authorization, and check ownership of every document a caller reads or writes by ID.
- Component functions (auth, Resend) are called from app functions, never directly from the client.
- Queries use `.withIndex()` and are bounded with `.take(n)` or pagination. No `.collect()` on tables that grow, and no `Date.now()` inside queries.
- Index names list their fields in order: `by_field1_and_field2`.
- Keep the schema minimal: three app tables or fewer by default. Justify anything beyond that in the PR.
- Declare env vars in `convex/convex.config.ts` under `env` and read them from `env` in `./_generated/server`, not `process.env`. Set values with `npx convex env set`; they never go in code or git.
- Actions that need Node built-ins go in their own file starting with `"use node";`.

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
- Branch names are short kebab-case with a type prefix: `feat/`, `fix/`, `chore/`.
- Commit subjects are imperative and under 72 characters (`Add feedback list query`). Use the body to explain why.
- Never commit secrets: no `.env` file of any name, deploy keys or OAuth secrets. App secrets live in the Convex deployment's env.
- Don't create git worktrees without asking.
